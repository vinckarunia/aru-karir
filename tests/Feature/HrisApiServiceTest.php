<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Candidate;
use App\Models\HrUser;
use App\Models\JobListing;
use App\Services\HrisApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HrisApiServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_active_projects_in_mock_mode()
    {
        Config::set('services.hris.mock_mode', true);

        $service = new HrisApiService();
        $projects = $service->getActiveProjects();

        $this->assertCount(3, $projects);
        $this->assertEquals('Project Alpha (Mock)', $projects[0]['name']);
    }

    public function test_create_data_request_in_mock_mode()
    {
        Config::set('services.hris.mock_mode', true);

        $hrUser = HrUser::create([
            'name' => 'Recruiter',
            'email' => 'recruiter@example.com',
            'password' => bcrypt('password'),
            'role' => 'hr',
        ]);

        $candidate = Candidate::create([
            'name' => 'John Doe',
            'ktp_number' => '1234567890123456',
            'gender' => 'male',
            'mother_name' => 'Jane Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password'),
        ]);

        $jobListing = JobListing::create([
            'title' => 'Security Guard',
            'slug' => 'security-guard',
            'description' => 'Guard the area',
            'requirements' => '1 year experience',
            'location' => 'Jakarta',
            'contract_type' => 'pkwt',
            'salary_visible' => false,
            'status' => 'published',
            'hris_project_id' => '1',
            'created_by' => $hrUser->id,
        ]);

        $application = Application::create([
            'candidate_id' => $candidate->id,
            'job_listing_id' => $jobListing->id,
            'current_stage' => 'onboarding',
            'current_status' => 'in_progress',
            'applied_at' => now(),
        ]);

        $service = new HrisApiService();
        $result = $service->createDataRequest($application);

        $this->assertTrue($result);
    }

    public function test_get_active_projects_makes_actual_http_request()
    {
        Config::set('services.hris.mock_mode', false);
        Config::set('services.hris.url', 'http://hris.test');
        Config::set('services.hris.key', 'testkey');

        Http::fake([
            'http://hris.test/api/internal/projects' => Http::response([
                'data' => [
                    ['id' => '10', 'name' => 'Real Project']
                ]
            ], 200)
        ]);

        $service = new HrisApiService();
        $projects = $service->getActiveProjects();

        $this->assertCount(1, $projects);
        $this->assertEquals('Real Project', $projects[0]['name']);
    }

    public function test_create_data_request_makes_actual_http_request()
    {
        Config::set('services.hris.mock_mode', false);
        Config::set('services.hris.url', 'http://hris.test');
        Config::set('services.hris.key', 'testkey');

        Http::fake([
            'http://hris.test/api/internal/data-requests' => Http::response([
                'success' => true,
            ], 201)
        ]);

        $hrUser = HrUser::create([
            'name' => 'Recruiter',
            'email' => 'recruiter@example.com',
            'password' => bcrypt('password'),
            'role' => 'hr',
        ]);

        $candidate = Candidate::create([
            'name' => 'John Doe',
            'ktp_number' => '1234567890123456',
            'gender' => 'male',
            'mother_name' => 'Jane Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password'),
        ]);

        $jobListing = JobListing::create([
            'title' => 'Security Guard',
            'slug' => 'security-guard',
            'description' => 'Guard the area',
            'requirements' => '1 year experience',
            'location' => 'Jakarta',
            'contract_type' => 'pkwt',
            'salary_visible' => false,
            'status' => 'published',
            'hris_project_id' => '10',
            'created_by' => $hrUser->id,
        ]);

        $application = Application::create([
            'candidate_id' => $candidate->id,
            'job_listing_id' => $jobListing->id,
            'current_stage' => 'onboarding',
            'current_status' => 'in_progress',
            'applied_at' => now(),
        ]);

        $service = new HrisApiService();
        $result = $service->createDataRequest($application);

        $this->assertTrue($result);

        Http::assertSent(function ($request) {
            return $request->hasHeader('X-API-Key', 'testkey') &&
                   $request->url() == 'http://hris.test/api/internal/data-requests' &&
                   $request['project_id'] === '10' &&
                   $request['requested_data']['name'] === 'John Doe';
        });
    }

    public function test_create_data_request_payload_format()
    {
        Config::set('services.hris.mock_mode', false);
        Config::set('services.hris.url', 'http://hris.test');
        Config::set('services.hris.key', 'testkey');

        Http::fake([
            'http://hris.test/api/internal/data-requests' => Http::response([
                'success' => true,
            ], 201)
        ]);

        $hrUser = HrUser::create([
            'name' => 'Recruiter',
            'email' => 'recruiter@example.com',
            'password' => bcrypt('password'),
            'role' => 'hr',
        ]);

        $candidate = Candidate::create([
            'name' => 'John Doe',
            'ktp_number' => '1234567890123456',
            'gender' => 'male',
            'mother_name' => 'Jane Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password'),
            'birth_place' => 'Jakarta',
            'birth_date' => '1995-05-15',
            'religion' => 'Islam',
            'blood_type' => 'O',
            'height' => 175,
            'weight' => 70,
            'phone_domicile' => '021-123456',
            'housing_status' => 'Milik Sendiri',
            'npwp' => '12.345.678.9-012.000',
            'bank_name' => 'BCA',
            'bank_account_number' => '987654321',
            'size_shoe' => 42,
            'size_uniform' => 'L',
            'father_name' => 'Father Doe',
            'father_birth_place_date' => 'Bandung, 1960-01-01',
            'father_job' => 'Pensiunan',
            'mother_birth_place_date' => 'Surabaya, 1965-02-02',
            'mother_job' => 'Ibu Rumah Tangga',
            'sibling_order' => 1,
            'sibling_count' => 3,
            'marital_status' => 'nikah',
            'spouse_name' => 'Spouse Doe',
            'spouse_birth_place_date' => 'Medan, 1996-03-03',
            'child_1_name' => 'Child One',
            'child_1_birth_place_date' => 'Jakarta, 2020-04-04',
            'school_name_city' => 'SMA 1 Jakarta',
            'school_major' => 'IPA',
            'school_graduation_year' => 2013,
            'work_experience' => [
                [
                    'company' => 'PT ABC',
                    'position' => 'Staff',
                    'period' => '2015-2018',
                    'last_salary' => '5000000',
                    'resign_reason' => 'Resign reason'
                ]
            ],
            'reference_name' => 'Ref Person',
            'reference_relationship' => 'Mantan Atasan',
            'reference_phone' => '089999999',
            'emergency_name' => 'Emer Person',
            'emergency_relationship' => 'Saudara',
            'emergency_phone' => '087777777',
            'emergency_address' => 'Emer Address',
        ]);

        $jobListing = JobListing::create([
            'title' => 'Security Guard',
            'slug' => 'security-guard',
            'description' => 'Guard the area',
            'requirements' => '1 year experience',
            'location' => 'Jakarta',
            'contract_type' => 'pkwt',
            'salary_visible' => false,
            'status' => 'published',
            'hris_project_id' => '10',
            'created_by' => $hrUser->id,
        ]);

        $application = Application::create([
            'candidate_id' => $candidate->id,
            'job_listing_id' => $jobListing->id,
            'current_stage' => 'onboarding',
            'current_status' => 'in_progress',
            'applied_at' => now(),
        ]);

        $service = new HrisApiService();
        $result = $service->createDataRequest($application);

        $this->assertTrue($result);

        Http::assertSent(function ($request) {
            $requestedData = $request['requested_data'];

            $hasFamilyMembers = count($requestedData['family_members']) === 4; // Father, Mother, Spouse, Child 1
            $firstFamilyMember = $requestedData['family_members'][0];
            $workExp = $requestedData['work_experience'];

            return $request->hasHeader('X-API-Key', 'testkey') &&
                   $request->url() == 'http://hris.test/api/internal/data-requests' &&
                   $request['project_id'] === '10' &&
                   $requestedData['name'] === 'John Doe' &&
                   $requestedData['birth_place'] === 'Jakarta' &&
                   $requestedData['religion'] === 'Islam' &&
                   $requestedData['blood_type'] === 'O' &&
                   (int)$requestedData['height'] === 175 &&
                   (int)$requestedData['weight'] === 70 &&
                   $requestedData['npwp'] === '12.345.678.9-012.000' &&
                   $requestedData['bank_name'] === 'BCA' &&
                   $requestedData['bank_account_number'] === '987654321' &&
                   (int)$requestedData['size_shoe'] === 42 &&
                   $requestedData['size_uniform'] === 'L' &&
                   $hasFamilyMembers &&
                   $firstFamilyMember['name'] === 'Father Doe' &&
                   $firstFamilyMember['birth_place'] === 'Bandung' &&
                   $firstFamilyMember['birth_date'] === '1960-01-01' &&
                   count($workExp) === 1 &&
                   $workExp[0]['company'] === 'PT ABC';
        });
    }
}
