<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Candidate;
use App\Models\HrUser;
use App\Models\JobListing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardUnreadApplicationsTest extends TestCase
{
    use RefreshDatabase;

    protected HrUser $hrUser;
    protected Candidate $candidate;
    protected JobListing $jobListing;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hrUser = HrUser::create([
            'name' => 'HR Staff',
            'email' => 'hr@example.com',
            'password' => bcrypt('password'),
            'role' => 'hr',
        ]);

        $this->candidate = Candidate::create([
            'name' => 'Kandidat',
            'email' => 'candidate@example.com',
            'password' => bcrypt('password'),
        ]);

        $this->jobListing = JobListing::create([
            'title' => 'Backend Developer',
            'slug' => 'backend-developer',
            'description' => 'Description',
            'requirements' => 'Requirements',
            'location' => 'Jakarta',
            'contract_type' => 'pkwt',
            'status' => 'published',
            'created_by' => $this->hrUser->id,
        ]);
    }

    public function test_dashboard_shows_only_applications_that_have_not_been_viewed(): void
    {
        $unreadApplication = $this->makeApplication();
        $readApplication = $this->makeApplication([
            'viewed_at' => now()->subDay(),
        ], 'read-candidate@example.com');

        $this->actingAs($this->hrUser, 'hr')
            ->get(route('hr.dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Hr/Dashboard', false)
                ->where('stats.unread_applications', 1)
                ->has('unreadApplications', 1)
                ->where('unreadApplications.0.id', $unreadApplication->id)
                ->missing('recentApplications')
            );

        $this->assertNotEquals($unreadApplication->id, $readApplication->id);
    }

    public function test_opening_application_detail_marks_it_as_viewed(): void
    {
        $application = $this->makeApplication();

        $this->actingAs($this->hrUser, 'hr')
            ->get(route('hr.pipeline.show', $application->id))
            ->assertOk();

        $this->assertNotNull($application->fresh()->viewed_at);

        $this->get(route('hr.dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.unread_applications', 0)
                ->has('unreadApplications', 0)
            );
    }

    private function makeApplication(array $overrides = [], ?string $candidateEmail = null): Application
    {
        $candidate = $candidateEmail
            ? Candidate::create([
                'name' => 'Kandidat Lain',
                'email' => $candidateEmail,
                'password' => bcrypt('password'),
            ])
            : $this->candidate;

        return Application::create(array_merge([
            'candidate_id' => $candidate->id,
            'job_listing_id' => $this->jobListing->id,
            'current_stage' => 'apply',
            'current_status' => 'in_progress',
            'applied_at' => now()->subDays(2),
        ], $overrides));
    }
}
