<?php

namespace App\Services;

use App\Models\Application;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HrisApiService
{
    protected string $url;
    protected ?string $key;
    protected bool $mockMode;

    public function __construct()
    {
        $this->url = rtrim(config('services.hris.url'), '/');
        $this->key = config('services.hris.key');
        $this->mockMode = (bool) config('services.hris.mock_mode', true);
    }

    /**
     * Fetch all active projects from HRIS.
     */
    public function getActiveProjects(): array
    {
        if ($this->mockMode) {
            return [
                ['id' => '1', 'name' => 'Project Alpha (Mock)'],
                ['id' => '2', 'name' => 'Project Beta (Mock)'],
                ['id' => '3', 'name' => 'Project Gamma (Mock)'],
            ];
        }

        try {
            $response = Http::withHeaders([
                'X-API-Key' => $this->key,
                'Accept' => 'application/json',
            ])->timeout(5)->get("{$this->url}/api/internal/projects");

            if ($response->successful()) {
                return $response->json('data') ?? $response->json() ?? [];
            }

            Log::error("HRIS API Projects failed with status {$response->status()}: " . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error("HRIS API Projects exception: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Create onboarding DataRequest in HRIS for the hired candidate.
     */
    public function createDataRequest(Application $application): bool
    {
        $candidate = $application->candidate;
        if (!$candidate) {
            Log::warning("Skipped HRIS sync: Application {$application->id} has no candidate relationship.");
            return false;
        }

        $requestedFields = [
            'name',
            'ktp_number',
            'birth_date',
            'gender',
            'phone',
            'email',
            'education',
            'address_ktp',
            'address_domicile',
            'mother_name',
            'birth_place',
            'religion',
            'blood_type',
            'height',
            'weight',
            'phone_domicile',
            'housing_status',
            'npwp',
            'bank_name',
            'bank_account_number',
            'size_shoe',
            'size_uniform',
            'reference_name',
            'reference_relationship',
            'reference_phone',
            'emergency_name',
            'emergency_relationship',
            'emergency_phone',
            'emergency_address',
            'school_name_city',
            'school_major',
            'school_graduation_year',
            'work_experience',
        ];

        $requestedData = [
            'name' => $candidate->name,
            'ktp_number' => $candidate->ktp_number,
            'birth_date' => $candidate->birth_date ? $candidate->birth_date->format('Y-m-d') : null,
            'gender' => $candidate->gender,
            'phone' => $candidate->phone,
            'email' => $candidate->email,
            'education' => $candidate->education_level,
            'address_ktp' => $candidate->address,
            'address_domicile' => $candidate->address_domicile ?: $candidate->address,
            'mother_name' => $candidate->mother_name,
            'birth_place' => $candidate->birth_place,
            'religion' => $candidate->religion,
            'blood_type' => $candidate->blood_type,
            'height' => $candidate->height,
            'weight' => $candidate->weight,
            'phone_domicile' => $candidate->phone_domicile,
            'housing_status' => $candidate->housing_status,
            'npwp' => $candidate->npwp,
            'bank_name' => $candidate->bank_name,
            'bank_account_number' => $candidate->bank_account_number,
            'size_shoe' => $candidate->size_shoe,
            'size_uniform' => $candidate->size_uniform,
            'reference_name' => $candidate->reference_name,
            'reference_relationship' => $candidate->reference_relationship,
            'reference_phone' => $candidate->reference_phone,
            'emergency_name' => $candidate->emergency_name,
            'emergency_relationship' => $candidate->emergency_relationship,
            'emergency_phone' => $candidate->emergency_phone,
            'emergency_address' => $candidate->emergency_address,
            'school_name_city' => $candidate->school_name_city,
            'school_major' => $candidate->school_major,
            'school_graduation_year' => $candidate->school_graduation_year,
            'work_experience' => $candidate->work_experience,
        ];

        if (!empty($candidate->references)) {
            $requestedFields[] = 'references';
            $requestedData['references'] = $candidate->references;
        }

        if (!empty($candidate->emergency_contacts)) {
            $requestedFields[] = 'emergency_contacts';
            $requestedData['emergency_contacts'] = $candidate->emergency_contacts;
        }

        // Format and append family members
        $familyMembers = [];

        // Helper to parse "Place, YYYY-MM-DD"
        $parseBirthPlaceDate = function ($value) {
            if (!$value) return ['place' => null, 'date' => null];
            if (str_contains($value, ',')) {
                $parts = explode(',', $value);
                return [
                    'place' => trim($parts[0]),
                    'date' => trim($parts[1]),
                ];
            }
            return ['place' => $value, 'date' => null];
        };

        if ($candidate->father_name) {
            $parsed = $parseBirthPlaceDate($candidate->father_birth_place_date);
            $familyMembers[] = [
                'relationship_type' => 'parent',
                'name' => $candidate->father_name,
                'birth_place' => $parsed['place'],
                'birth_date' => $parsed['date'],
                'nik' => null,
                'bpjs_number' => null,
            ];
        }

        if ($candidate->mother_name) {
            $parsed = $parseBirthPlaceDate($candidate->mother_birth_place_date);
            $familyMembers[] = [
                'relationship_type' => 'parent',
                'name' => $candidate->mother_name,
                'birth_place' => $parsed['place'],
                'birth_date' => $parsed['date'],
                'nik' => null,
                'bpjs_number' => null,
            ];
        }

        if ($candidate->marital_status === 'nikah' && $candidate->spouse_name) {
            $parsed = $parseBirthPlaceDate($candidate->spouse_birth_place_date);
            $familyMembers[] = [
                'relationship_type' => 'spouse',
                'name' => $candidate->spouse_name,
                'birth_place' => $parsed['place'],
                'birth_date' => $parsed['date'],
                'nik' => null,
                'bpjs_number' => null,
            ];
        }

        if ($candidate->child_1_name) {
            $parsed = $parseBirthPlaceDate($candidate->child_1_birth_place_date);
            $familyMembers[] = [
                'relationship_type' => 'child',
                'name' => $candidate->child_1_name,
                'birth_place' => $parsed['place'],
                'birth_date' => $parsed['date'],
                'nik' => null,
                'bpjs_number' => null,
            ];
        }

        if ($candidate->child_2_name) {
            $parsed = $parseBirthPlaceDate($candidate->child_2_birth_place_date);
            $familyMembers[] = [
                'relationship_type' => 'child',
                'name' => $candidate->child_2_name,
                'birth_place' => $parsed['place'],
                'birth_date' => $parsed['date'],
                'nik' => null,
                'bpjs_number' => null,
            ];
        }

        if ($candidate->child_3_name) {
            $parsed = $parseBirthPlaceDate($candidate->child_3_birth_place_date);
            $familyMembers[] = [
                'relationship_type' => 'child',
                'name' => $candidate->child_3_name,
                'birth_place' => $parsed['place'],
                'birth_date' => $parsed['date'],
                'nik' => null,
                'bpjs_number' => null,
            ];
        }

        if (!empty($familyMembers)) {
            $requestedFields[] = 'family_members';
            $requestedData['family_members'] = $familyMembers;
        }

        $documents = [];
        $fieldValues = $candidate->fieldValues ?? $candidate->field_values ?? [];
        foreach ($fieldValues as $fv) {
            $field = $fv->profileField ?? $fv->profile_field;
            if (!$field) continue;

            $cleanFieldName = strtolower(str_replace([' ', '-'], '_', $field->field_name));

            if ($field->field_type === 'file' && $fv->file_path) {
                // Map documents (KTP, KK, or any other file fields)
                $docType = null;
                if (str_contains($cleanFieldName, 'kk') || str_contains($cleanFieldName, 'keluarga')) {
                    $docType = 'KK';
                } else if (str_contains($cleanFieldName, 'ktp')) {
                    $docType = 'KTP';
                } else {
                    // Fallback to uppercase field name for other files
                    $docType = strtoupper($cleanFieldName);
                }
                
                $documents[] = [
                    'type' => $docType,
                    'file_path' => $fv->file_path,
                ];

                // Also throw the file path as the value for the specific custom field key
                if (!in_array($cleanFieldName, $requestedFields)) {
                    $requestedFields[] = $cleanFieldName;
                }
                $requestedData[$cleanFieldName] = $fv->file_path;
            } else {
                // Throw all other non-file custom fields directly
                if (!in_array($cleanFieldName, $requestedFields)) {
                    $requestedFields[] = $cleanFieldName;
                }
                $requestedData[$cleanFieldName] = $fv->value;
            }
        }

        if (!empty($documents)) {
            $requestedFields[] = 'documents';
            $requestedData['documents'] = $documents;
        }

        $job = $application->jobListing;
        $projectId = $job ? $job->hris_project_id : null;

        $payload = [
            'worker_id' => null,
            'project_id' => $projectId,
            'request_type' => 'new_data',
            'requested_fields' => $requestedFields,
            'requested_data' => $requestedData,
            'notes' => 'Onboarding otomatis via ARUKarir Portal - Lowongan: ' . ($job->title ?? 'N/A'),
        ];

        if ($this->mockMode) {
            Log::info("HRIS Onboarding Sync (MOCK MODE ENABLED): Payload dispatched:", $payload);
            return true;
        }

        try {
            $response = Http::withHeaders([
                'X-API-Key' => $this->key,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->timeout(8)->post("{$this->url}/api/internal/data-requests", $payload);

            if ($response->successful()) {
                Log::info("HRIS Onboarding Sync successful for Candidate {$candidate->name} (App ID: {$application->id}).");
                return true;
            }

            Log::error("HRIS Onboarding Sync failed with status {$response->status()}: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("HRIS Onboarding Sync Exception: " . $e->getMessage());
            return false;
        }
    }
}
