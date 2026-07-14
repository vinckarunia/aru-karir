<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Candidate extends Authenticatable
{
    use HasUuids, Notifiable;

    protected $guard = 'candidate';

    protected $fillable = [
        'email',
        'password',
        'name',
        'phone',
        'birth_date',
        'gender',
        'ktp_number',
        'mother_name',
        'address',
        'education_level',
        'cv_path',
        'profile_photo_path',
        'profile_completed_at',
        'birth_place',
        'religion',
        'blood_type',
        'height',
        'weight',
        'address_domicile',
        'phone_domicile',
        'housing_status',
        'npwp',
        'bank_account_number',
        'bank_name',
        'father_name',
        'father_birth_place_date',
        'father_job',
        'mother_birth_place_date',
        'mother_job',
        'sibling_order',
        'sibling_count',
        'marital_status',
        'spouse_name',
        'spouse_birth_place_date',
        'child_1_name',
        'child_1_birth_place_date',
        'child_2_name',
        'child_2_birth_place_date',
        'child_3_name',
        'child_3_birth_place_date',
        'school_name_city',
        'school_major',
        'school_graduation_year',
        'work_experience',
        'reference_name',
        'reference_relationship',
        'reference_phone',
        'emergency_name',
        'emergency_relationship',
        'emergency_phone',
        'emergency_address',
        'size_shoe',
        'size_uniform',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'profile_completed_at' => 'datetime',
            'birth_date' => 'date',
            'password' => 'hashed',
            'work_experience' => 'array',
        ];
    }

    /**
     * Check if the candidate has completed their profile.
     */
    public function getIsProfileCompleteAttribute(): bool
    {
        return !is_null($this->profile_completed_at);
    }

    public static function getRequiredByDefaultFields(): array
    {
        return [
            'name',
            'phone',
            'birth_place',
            'birth_date',
            'gender',
            'religion',
            'ktp_number',
            'address',
            'cv_path',
            'profile_photo_path',
            'mother_name',
            'marital_status',
            'education_level',
            'school_graduation_year',
            'emergency_name',
            'emergency_relationship',
            'emergency_phone',
            'emergency_address',
        ];
    }

    public function satisfiesRequiredFields(?JobListing $jobListing = null): bool
    {
        $fieldsToCheck = self::getRequiredByDefaultFields();
        
        if ($jobListing && is_array($jobListing->required_fields)) {
            foreach ($jobListing->required_fields as $jobField) {
                $mappedField = $jobField;
                if ($jobField === 'cv') $mappedField = 'cv_path';
                if ($jobField === 'profile_photo') $mappedField = 'profile_photo_path';
                if (!in_array($mappedField, $fieldsToCheck)) {
                    $fieldsToCheck[] = $mappedField;
                }
            }
        }

        foreach ($fieldsToCheck as $field) {
            $val = $this->getAttribute($field);
            if (is_null($val) || (is_string($val) && trim($val) === '')) {
                return false;
            }
        }

        // Conditional spouse validation if married
        if ($this->marital_status === 'nikah') {
            if ($jobListing && is_array($jobListing->required_fields)) {
                if (in_array('spouse_name', $jobListing->required_fields) && (is_null($this->spouse_name) || trim($this->spouse_name) === '')) {
                    return false;
                }
                if (in_array('spouse_birth_place_date', $jobListing->required_fields) && (is_null($this->spouse_birth_place_date) || trim($this->spouse_birth_place_date) === '')) {
                    return false;
                }
            }
        }

        // Check active required custom fields
        $requiredCustomFields = \App\Models\CandidateProfileField::where('is_active', true)
            ->where('is_required', true)
            ->get();

        foreach ($requiredCustomFields as $customField) {
            $valueRecord = \App\Models\CandidateFieldValue::where('candidate_id', $this->id)
                ->where('profile_field_id', $customField->id)
                ->first();

            if ($customField->field_type === 'file') {
                if (!$valueRecord || is_null($valueRecord->file_path) || trim($valueRecord->file_path) === '') {
                    return false;
                }
            } else {
                if (!$valueRecord || is_null($valueRecord->value) || trim($valueRecord->value) === '') {
                    return false;
                }
            }
        }

        return true;
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function fieldValues(): HasMany
    {
        return $this->hasMany(CandidateFieldValue::class);
    }
}
