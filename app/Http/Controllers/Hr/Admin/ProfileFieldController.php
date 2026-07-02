<?php

namespace App\Http\Controllers\Hr\Admin;

use App\Http\Controllers\Controller;
use App\Models\CandidateProfileField;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileFieldController extends Controller
{
    public function index()
    {
        $fields = CandidateProfileField::orderBy('sort_order')->get();

        return \Inertia\Inertia::render('Hr/Admin/Config/Index', [
            'fields' => $fields,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'field_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9_]+$/', // snake_case only
                'unique:candidate_profile_fields,field_name',
                // Avoid collision with Candidate model native fields
                Rule::notIn([
                    'id', 'email', 'password', 'name', 'phone', 'birth_date', 'gender',
                    'ktp_number', 'mother_name', 'address', 'education_level',
                    'cv_path', 'profile_photo_path', 'profile_completed_at',
                    'email_verified_at', 'remember_token', 'created_at', 'updated_at'
                ]),
            ],
            'field_label' => 'required|string|max:255',
            'field_type' => 'required|in:text,textarea,file,select',
            'is_required' => 'required|boolean',
            'options' => 'nullable|array',
            'options.*' => 'required|string|max:255',
        ]);

        $maxSort = CandidateProfileField::max('sort_order') ?? 0;

        CandidateProfileField::create([
            'field_name' => $validated['field_name'],
            'field_label' => $validated['field_label'],
            'field_type' => $validated['field_type'],
            'is_required' => $validated['is_required'],
            'options' => $validated['field_type'] === 'select' ? ($validated['options'] ?? []) : null,
            'sort_order' => $maxSort + 1,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Field profil kustom berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $field = CandidateProfileField::findOrFail($id);

        $validated = $request->validate([
            'field_label' => 'required|string|max:255',
            'field_type' => 'required|in:text,textarea,file,select',
            'is_required' => 'required|boolean',
            'options' => 'nullable|array',
            'options.*' => 'required|string|max:255',
            'is_active' => 'required|boolean',
        ]);

        $field->update([
            'field_label' => $validated['field_label'],
            'field_type' => $validated['field_type'],
            'is_required' => $validated['is_required'],
            'options' => $validated['field_type'] === 'select' ? ($validated['options'] ?? []) : null,
            'is_active' => $validated['is_active'],
        ]);

        return redirect()->back()->with('success', 'Field profil kustom berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $field = CandidateProfileField::findOrFail($id);
        $field->delete();

        return redirect()->back()->with('success', 'Field profil kustom berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:candidate_profile_fields,id',
        ]);

        foreach ($validated['ids'] as $index => $id) {
            CandidateProfileField::where('id', $id)->update(['sort_order' => $index + 1]);
        }

        return redirect()->back()->with('success', 'Urutan field berhasil diperbarui.');
    }
}
