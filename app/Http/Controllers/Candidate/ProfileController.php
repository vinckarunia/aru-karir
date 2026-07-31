<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\CandidateProfileField;
use App\Models\CandidateFieldValue;
use App\Models\JobListing;
use App\Models\BusinessOption;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;
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

        $jobListing = null;
        if ($request->filled('job')) {
            $jobListing = JobListing::where('slug', $request->query('job'))->first();
        }

        return Inertia::render('Candidate/Profile/Edit', [
            'candidate' => $candidate,
            'customFields' => $customFields,
            'customValues' => $customValues,
            'job' => $request->query('job'),
            'jobRequiredFields' => $jobListing ? ($jobListing->required_fields ?: []) : [],
            'businessOptions' => BusinessOption::grouped(false),
        ]);
    }

    /**
     * Update the candidate's profile.
     */
    public function update(Request $request): RedirectResponse
    {
        /** @var \App\Models\Candidate $candidate */
        $candidate = Auth::guard('candidate')->user();

        // Required by default fields
        $requiredByDefault = [
            'name',
            'phone',
            'birth_place',
            'birth_date',
            'gender',
            'religion',
            'ktp_number',
            'address',
            'mother_name',
            'marital_status',
            'education_level',
            'school_graduation_year',
            'emergency_name',
            'emergency_relationship',
            'emergency_phone',
            'emergency_address',
        ];

        // Retrieve job-specific required fields
        $jobRequiredFields = [];
        if ($request->filled('job')) {
            $jobListing = JobListing::where('slug', $request->input('job'))->first();
            if ($jobListing && is_array($jobListing->required_fields)) {
                $jobRequiredFields = $jobListing->required_fields;
            }
        }

        $isFieldRequired = function ($fieldName) use ($requiredByDefault, $jobRequiredFields) {
            return in_array($fieldName, $requiredByDefault) || in_array($fieldName, $jobRequiredFields);
        };
        $allowedOptionCodes = fn (string $group, ?string $current) => array_values(array_unique(array_filter([
            ...BusinessOption::codes($group),
            $current,
        ])));

        // 1. Standard Fields Validation
        $rules = [
            'name' => ($isFieldRequired('name') ? 'required' : 'nullable') . '|string|max:255',
            'phone' => ($isFieldRequired('phone') ? 'required' : 'nullable') . '|string|max:20',
            'birth_date' => ($isFieldRequired('birth_date') ? 'required' : 'nullable') . '|date',
            'gender' => [$isFieldRequired('gender') ? 'required' : 'nullable', 'string', Rule::in($allowedOptionCodes('gender', $candidate->gender))],
            'ktp_number' => ($isFieldRequired('ktp_number') ? 'required' : 'nullable') . '|string|digits:16',
            'mother_name' => ($isFieldRequired('mother_name') ? 'required' : 'nullable') . '|string|max:255',
            'address' => ($isFieldRequired('address') ? 'required' : 'nullable') . '|string',
            'education_level' => [$isFieldRequired('education_level') ? 'required' : 'nullable', 'string', Rule::in($allowedOptionCodes('education_level', $candidate->education_level))],
            'cv' => ($candidate->cv_path ? 'nullable' : 'required') . '|file|mimes:pdf|max:5120',
            'profile_photo' => ($candidate->profile_photo_path ? 'nullable' : 'required') . '|image|mimes:jpg,jpeg,png|max:2048',

            // Personal & Domicile
            'birth_place' => ($isFieldRequired('birth_place') ? 'required' : 'nullable') . '|string|max:255',
            'religion' => [$isFieldRequired('religion') ? 'required' : 'nullable', 'string', Rule::in($allowedOptionCodes('religion', $candidate->religion))],
            'blood_type' => [$isFieldRequired('blood_type') ? 'required' : 'nullable', 'string', Rule::in($allowedOptionCodes('blood_type', $candidate->blood_type))],
            'height' => ($isFieldRequired('height') ? 'required' : 'nullable') . '|integer|min:50|max:300',
            'weight' => ($isFieldRequired('weight') ? 'required' : 'nullable') . '|integer|min:10|max:500',
            'address_domicile' => ($isFieldRequired('address_domicile') ? 'required' : 'nullable') . '|string',
            'phone_domicile' => ($isFieldRequired('phone_domicile') ? 'required' : 'nullable') . '|string|max:20',
            'housing_status' => ($isFieldRequired('housing_status') ? 'required' : 'nullable') . '|string|max:255',
            'npwp' => ($isFieldRequired('npwp') ? 'required' : 'nullable') . '|string|max:255',
            'bank_name' => ($isFieldRequired('bank_name') ? 'required' : 'nullable') . '|string|max:255',
            'bank_account_number' => ($isFieldRequired('bank_account_number') ? 'required' : 'nullable') . '|string|max:255',

            // Family Details
            'father_name' => ($isFieldRequired('father_name') ? 'required' : 'nullable') . '|string|max:255',
            'father_birth_place_date' => ($isFieldRequired('father_birth_place_date') ? 'required' : 'nullable') . '|string|max:255',
            'father_job' => ($isFieldRequired('father_job') ? 'required' : 'nullable') . '|string|max:255',
            'mother_birth_place_date' => ($isFieldRequired('mother_birth_place_date') ? 'required' : 'nullable') . '|string|max:255',
            'mother_job' => ($isFieldRequired('mother_job') ? 'required' : 'nullable') . '|string|max:255',
            'sibling_order' => ($isFieldRequired('sibling_order') ? 'required' : 'nullable') . '|integer|min:1',
            'sibling_count' => ($isFieldRequired('sibling_count') ? 'required' : 'nullable') . '|integer|min:1',
            'marital_status' => [$isFieldRequired('marital_status') ? 'required' : 'nullable', 'string', Rule::in($allowedOptionCodes('marital_status', $candidate->marital_status))],
            'spouse_name' => ($isFieldRequired('spouse_name') ? 'required_if:marital_status,nikah' : 'nullable') . '|string|max:255',
            'spouse_birth_place_date' => ($isFieldRequired('spouse_birth_place_date') ? 'required_if:marital_status,nikah' : 'nullable') . '|string|max:255',
            'child_1_name' => 'nullable|string|max:255',
            'child_1_birth_place_date' => 'nullable|string|max:255',
            'child_2_name' => 'nullable|string|max:255',
            'child_2_birth_place_date' => 'nullable|string|max:255',
            'child_3_name' => 'nullable|string|max:255',
            'child_3_birth_place_date' => 'nullable|string|max:255',

            // Education & Experience
            'school_name_city' => ($isFieldRequired('school_name_city') ? 'required' : 'nullable') . '|string|max:255',
            'school_major' => ($isFieldRequired('school_major') ? 'required' : 'nullable') . '|string|max:255',
            'school_graduation_year' => ($isFieldRequired('school_graduation_year') ? 'required' : 'nullable') . '|integer|min:1900|max:2100',
            'work_experience' => ($isFieldRequired('work_experience') ? 'required' : 'nullable') . '|array',
            'work_experience.*.company' => 'required|string|max:255',
            'work_experience.*.position' => 'required|string|max:255',
            'work_experience.*.period' => 'required|string|max:255',
            'work_experience.*.last_salary' => 'required|string|max:255',
            'work_experience.*.resign_reason' => 'required|string|max:255',

            // References & Emergency Contacts
            'reference_name' => 'nullable|string|max:255',
            'reference_relationship' => 'nullable|string|max:255',
            'reference_phone' => 'nullable|string|max:255',
            'emergency_name' => 'nullable|string|max:255',
            'emergency_relationship' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:255',
            'emergency_address' => 'nullable|string',
            'references' => 'nullable|array|max:3',
            'references.*.name' => 'required|string|max:255',
            'references.*.relationship' => 'required|string|max:255',
            'references.*.phone' => 'required|string|max:255',
            'emergency_contacts' => 'required|array|min:1|max:3',
            'emergency_contacts.*.name' => 'required|string|max:255',
            'emergency_contacts.*.relationship' => 'required|string|max:255',
            'emergency_contacts.*.phone' => 'required|string|max:255',
            'emergency_contacts.*.address' => 'required|string',

            // Sizes
            'size_shoe' => ($isFieldRequired('size_shoe') ? 'required' : 'nullable') . '|integer|min:10|max:60',
            'size_uniform' => [$isFieldRequired('size_uniform') ? 'required' : 'nullable', 'string', Rule::in($allowedOptionCodes('uniform_size', $candidate->size_uniform))],
        ];

        // 2. Custom Fields Validation
        $customFields = CandidateProfileField::where('is_active', true)->get();
        $customRules = [];
        $customAttributes = [];

        foreach ($customFields as $field) {
            $inputName = 'custom_' . $field->id;
            $fieldRule = [];
            $customAttributes[$inputName] = $field->field_label;
            $customAttributes[$inputName . '.*'] = $field->field_label;

            if ($field->is_required) {
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
            } elseif ($field->field_type === 'checklist') {
                $fieldRule[] = 'array';
                if (!empty($field->options)) {
                    $customRules[$inputName . '.*'] = [Rule::in($field->options)];
                }
            }

            $customRules[$inputName] = $fieldRule;
        }

        // Run validation
        $validatedData = $request->validate(array_merge($rules, $customRules), [], $customAttributes);

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
            'birth_place' => $request->birth_place,
            'religion' => $request->religion,
            'blood_type' => $request->blood_type,
            'height' => $request->height,
            'weight' => $request->weight,
            'address_domicile' => $request->address_domicile,
            'phone_domicile' => $request->phone_domicile,
            'housing_status' => $request->housing_status,
            'npwp' => $request->npwp,
            'bank_name' => $request->bank_name,
            'bank_account_number' => $request->bank_account_number,
            'father_name' => $request->father_name,
            'father_birth_place_date' => $request->father_birth_place_date,
            'father_job' => $request->father_job,
            'mother_birth_place_date' => $request->mother_birth_place_date,
            'mother_job' => $request->mother_job,
            'sibling_order' => $request->sibling_order,
            'sibling_count' => $request->sibling_count,
            'marital_status' => $request->marital_status,
            'spouse_name' => $request->spouse_name,
            'spouse_birth_place_date' => $request->spouse_birth_place_date,
            'child_1_name' => $request->child_1_name,
            'child_1_birth_place_date' => $request->child_1_birth_place_date,
            'child_2_name' => $request->child_2_name,
            'child_2_birth_place_date' => $request->child_2_birth_place_date,
            'child_3_name' => $request->child_3_name,
            'child_3_birth_place_date' => $request->child_3_birth_place_date,
            'school_name_city' => $request->school_name_city,
            'school_major' => $request->school_major,
            'school_graduation_year' => $request->school_graduation_year,
            'work_experience' => $request->work_experience,
            'reference_name' => $request->input('references.0.name'),
            'reference_relationship' => $request->input('references.0.relationship'),
            'reference_phone' => $request->input('references.0.phone'),
            'emergency_name' => $request->input('emergency_contacts.0.name'),
            'emergency_relationship' => $request->input('emergency_contacts.0.relationship'),
            'emergency_phone' => $request->input('emergency_contacts.0.phone'),
            'emergency_address' => $request->input('emergency_contacts.0.address'),
            'references' => $request->references ?? [],
            'emergency_contacts' => $request->emergency_contacts ?? [],
            'size_shoe' => $request->size_shoe,
            'size_uniform' => $request->size_uniform,
        ];

        // Handle CV Upload
        if ($request->hasFile('cv')) {
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
                        ['file_path' => "/{$customDir}/{$customFileName}", 'value' => $customFile->getClientOriginalName() ?? $customFileName]
                    );
                }
            } else {
                if ($request->has($inputName)) {
                    CandidateFieldValue::updateOrCreate(
                        ['candidate_id' => $candidate->id, 'profile_field_id' => $field->id],
                        ['value' => $field->field_type === 'checklist'
                            ? json_encode($request->input($inputName, []))
                            : $request->input($inputName)]
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
