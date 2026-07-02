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
}
