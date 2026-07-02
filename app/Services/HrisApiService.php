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
        ];

        $requestedData = [
            'name' => $candidate->name,
            'ktp_number' => $candidate->ktp_number,
            'birth_date' => $candidate->birth_date,
            'gender' => $candidate->gender,
            'phone' => $candidate->phone,
            'email' => $candidate->email,
            'education' => $candidate->education_level,
            'address_ktp' => $candidate->address,
            'address_domicile' => $candidate->address,
            'mother_name' => $candidate->mother_name,
        ];

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
