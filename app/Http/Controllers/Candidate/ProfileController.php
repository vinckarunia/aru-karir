<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\CandidateProfileField;
use App\Models\CandidateFieldValue;
use App\Models\JobListing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the profile edit form.
     */
    public function edit(Request $request): Response
    {
        $candidate = Auth::guard('candidate')->user();
        
        $customFields = CandidateProfileField::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $customValues = CandidateFieldValue::where('candidate_id', $candidate->id)
            ->get()
            ->keyBy('profile_field_id');

        return Inertia::render('Candidate/Profile/Edit', [
            'candidate' => $candidate,
            'customFields' => $customFields,
            'customValues' => $customValues,
            'job' => $request->query('job'),
        ]);
    }

    /**
     * Update the candidate's profile.
     */
    public function update(Request $request): RedirectResponse
    {
        /** @var \App\Models\Candidate $candidate */
        $candidate = Auth::guard('candidate')->user();

        // 1. Standard Fields Validation
        $rules = [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'birth_date' => 'required|date',
            'gender' => 'required|in:male,female',
            'ktp_number' => 'required|string|digits:16',
            'mother_name' => 'required|string|max:255',
            'address' => 'required|string',
            'education_level' => 'required|string|max:255',
            'cv' => $candidate->cv_path ? 'nullable|file|mimes:pdf|max:5120' : 'required|file|mimes:pdf|max:5120',
            'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ];

        // 2. Custom Fields Validation
        $customFields = CandidateProfileField::where('is_active', true)->get();
        $customRules = [];

        foreach ($customFields as $field) {
            $inputName = 'custom_' . $field->id;
            $fieldRule = [];

            if ($field->is_required) {
                // If file type, check if value already exists
                if ($field->field_type === 'file') {
                    $existing = CandidateFieldValue::where('candidate_id', $candidate->id)
                        ->where('profile_field_id', $field->id)
                        ->first();
                    if (!$existing || !$existing->file_path) {
                        $fieldRule[] = 'required';
                    } else {
                        $fieldRule[] = 'nullable';
                    }
                } else {
                    $fieldRule[] = 'required';
                }
            } else {
                $fieldRule[] = 'nullable';
            }

            if ($field->field_type === 'file') {
                $fieldRule[] = 'file';
                $fieldRule[] = 'max:5120';
            } elseif ($field->field_type === 'text' || $field->field_type === 'textarea') {
                $fieldRule[] = 'string';
            } elseif ($field->field_type === 'select') {
                $fieldRule[] = 'string';
                if (!empty($field->options)) {
                    $fieldRule[] = 'in:' . implode(',', $field->options);
                }
            }

            $customRules[$inputName] = $fieldRule;
        }

        // Run validation
        $validatedData = $request->validate(array_merge($rules, $customRules));

        // 3. Save Standard Fields
        $candidateData = [
            'name' => $request->name,
            'phone' => $request->phone,
            'birth_date' => $request->birth_date,
            'gender' => $request->gender,
            'ktp_number' => $request->ktp_number,
            'mother_name' => $request->mother_name,
            'address' => $request->address,
            'education_level' => $request->education_level,
        ];

        // Handle CV Upload
        if ($request->hasFile('cv')) {
            // Delete old file if exists
            if ($candidate->cv_path && File::exists(public_path($candidate->cv_path))) {
                File::delete(public_path($candidate->cv_path));
            }

            $cvFile = $request->file('cv');
            $cvName = 'cv_' . time() . '_' . uniqid() . '.' . $cvFile->getClientOriginalExtension();
            $cvDir = "uploads/cv/{$candidate->id}";
            $cvFile->move(public_path($cvDir), $cvName);
            $candidateData['cv_path'] = "/{$cvDir}/{$cvName}";
        }

        // Handle Profile Photo Upload
        if ($request->hasFile('profile_photo')) {
            // Delete old photo if exists
            if ($candidate->profile_photo_path && File::exists(public_path($candidate->profile_photo_path))) {
                File::delete(public_path($candidate->profile_photo_path));
            }

            $photoFile = $request->file('profile_photo');
            $photoName = 'photo_' . time() . '_' . uniqid() . '.' . $photoFile->getClientOriginalExtension();
            $photoDir = "uploads/photo/{$candidate->id}";
            $photoFile->move(public_path($photoDir), $photoName);
            $candidateData['profile_photo_path'] = "/{$photoDir}/{$photoName}";
        }

        // Mark profile complete
        $candidateData['profile_completed_at'] = now();
        $candidate->update($candidateData);

        // 4. Save Custom Fields Values
        foreach ($customFields as $field) {
            $inputName = 'custom_' . $field->id;

            if ($field->field_type === 'file') {
                if ($request->hasFile($inputName)) {
                    // Fetch existing for deletion
                    $existing = CandidateFieldValue::where('candidate_id', $candidate->id)
                        ->where('profile_field_id', $field->id)
                        ->first();
                    if ($existing && $existing->file_path && File::exists(public_path($existing->file_path))) {
                        File::delete(public_path($existing->file_path));
                    }

                    $customFile = $request->file($inputName);
                    $customFileName = 'custom_' . $field->id . '_' . time() . '_' . uniqid() . '.' . $customFile->getClientOriginalExtension();
                    $customDir = "uploads/custom/{$candidate->id}";
                    $customFile->move(public_path($customDir), $customFileName);

                    CandidateFieldValue::updateOrCreate(
                        ['candidate_id' => $candidate->id, 'profile_field_id' => $field->id],
                        ['file_path' => "/{$customDir}/{$customFileName}", 'value' => $customFile->getClientOriginalOriginalName() ?? $customFileName]
                    );
                }
            } else {
                if ($request->has($inputName)) {
                    CandidateFieldValue::updateOrCreate(
                        ['candidate_id' => $candidate->id, 'profile_field_id' => $field->id],
                        ['value' => $request->input($inputName)]
                    );
                }
            }
        }

        // Check if there is an intended job
        $intendedJobSlug = $request->input('job');
        if ($intendedJobSlug) {
            $job = JobListing::where('slug', $intendedJobSlug)->first();
            if ($job) {
                return redirect()->route('job.detail', $job->slug)
                    ->with('success', 'Profil Anda telah dilengkapi. Silakan kirim lamaran Anda!');
            }
        }

        return redirect()->route('candidate.profile.edit')
            ->with('success', 'Profil Anda berhasil diperbarui.');
    }
}
