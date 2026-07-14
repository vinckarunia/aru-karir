<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\ApplicationStage;
use App\Models\Candidate;
use App\Models\HrUser;
use App\Models\JobListing;
use App\Notifications\ApplicationStatusChanged;
use App\Notifications\ApplicationSubmitted;
use App\Notifications\InterviewScheduled;
use App\Notifications\NewApplicationReceived;
use App\Notifications\OfferingSent;
use App\Notifications\OnboardingTriggered;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected HrUser $hrUser;
    protected Candidate $candidate;
    protected JobListing $jobListing;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hrUser = HrUser::create([
            'name' => 'Recruiter',
            'email' => 'recruiter@example.com',
            'password' => bcrypt('password'),
            'role' => 'hr',
        ]);

        $this->candidate = Candidate::create([
            'name' => 'John Doe',
            'phone' => '08123456789',
            'birth_place' => 'Jakarta',
            'birth_date' => '1990-01-01',
            'gender' => 'male',
            'religion' => 'Islam',
            'ktp_number' => '1234567890123456',
            'address' => 'Jl. Testing No. 1',
            'cv_path' => '/uploads/cv/1/mock.pdf',
            'profile_photo_path' => '/uploads/photo/1/mock.png',
            'mother_name' => 'Jane Doe',
            'marital_status' => 'belum_nikah',
            'education_level' => 'S1',
            'school_graduation_year' => 2012,
            'emergency_name' => 'Emergency Contact',
            'emergency_relationship' => 'Brother',
            'emergency_phone' => '08987654321',
            'emergency_address' => 'Jl. Emergency No. 2',
            'email' => 'john@example.com',
            'password' => bcrypt('password'),
            'profile_completed_at' => now(), // complete profile so candidate can apply
        ]);

        $this->jobListing = JobListing::create([
            'title' => 'Security Guard',
            'slug' => 'security-guard',
            'description' => 'Guard the area',
            'requirements' => '1 year experience',
            'location' => 'Jakarta',
            'contract_type' => 'pkwt',
            'salary_visible' => false,
            'status' => 'published',
            'created_by' => $this->hrUser->id,
        ]);
    }

    public function test_application_submission_triggers_notifications()
    {
        Notification::fake();

        $this->actingAs($this->candidate, 'candidate');

        $response = $this->post(route('candidate.apply', $this->jobListing->id));

        $response->assertRedirect(route('candidate.applications.index'));

        Notification::assertSentTo($this->candidate, ApplicationSubmitted::class, function ($notification) {
            return $notification->jobListing->id === $this->jobListing->id;
        });

        Notification::assertSentTo($this->hrUser, NewApplicationReceived::class, function ($notification) {
            return $notification->jobListing->id === $this->jobListing->id && $notification->candidate->id === $this->candidate->id;
        });
    }

    public function test_advancing_stage_triggers_appropriate_notification()
    {
        Notification::fake();

        $application = Application::create([
            'candidate_id' => $this->candidate->id,
            'job_listing_id' => $this->jobListing->id,
            'current_stage' => 'apply',
            'current_status' => 'in_progress',
            'applied_at' => now(),
        ]);

        ApplicationStage::create([
            'application_id' => $application->id,
            'stage_name' => 'apply',
            'status' => 'in_progress',
            'actioned_at' => now(),
        ]);

        $this->actingAs($this->hrUser, 'hr');

        // Advance from apply to screening
        $response = $this->post(route('hr.pipeline.advance', $application->id), [
            'notes' => 'Passed screening'
        ]);

        $response->assertRedirect();
        
        Notification::assertSentTo($this->candidate, ApplicationStatusChanged::class, function ($notification) {
            return $notification->stageName === 'screening' && $notification->status === 'passed';
        });
    }

    public function test_advancing_to_interview_triggers_interview_scheduled()
    {
        Notification::fake();

        $application = Application::create([
            'candidate_id' => $this->candidate->id,
            'job_listing_id' => $this->jobListing->id,
            'current_stage' => 'screening',
            'current_status' => 'in_progress',
            'applied_at' => now(),
        ]);

        ApplicationStage::create([
            'application_id' => $application->id,
            'stage_name' => 'screening',
            'status' => 'in_progress',
            'actioned_at' => now(),
        ]);

        $this->actingAs($this->hrUser, 'hr');

        // Advance from screening to interview_hr
        $response = $this->post(route('hr.pipeline.advance', $application->id), [
            'notes' => 'Interview scheduled at 10 AM'
        ]);

        $response->assertRedirect();
        
        Notification::assertSentTo($this->candidate, InterviewScheduled::class, function ($notification) {
            return $notification->stageName === 'interview_hr' && $notification->scheduleNotes === 'Interview scheduled at 10 AM';
        });
    }

    public function test_advancing_to_offering_triggers_offering_sent()
    {
        Notification::fake();

        $application = Application::create([
            'candidate_id' => $this->candidate->id,
            'job_listing_id' => $this->jobListing->id,
            'current_stage' => 'interview_client',
            'current_status' => 'in_progress',
            'applied_at' => now(),
        ]);

        ApplicationStage::create([
            'application_id' => $application->id,
            'stage_name' => 'interview_client',
            'status' => 'in_progress',
            'actioned_at' => now(),
        ]);

        $this->actingAs($this->hrUser, 'hr');

        // Advance from interview_client to offering
        $response = $this->post(route('hr.pipeline.advance', $application->id), [
            'notes' => 'Sending offering letter.'
        ]);

        $response->assertRedirect();
        
        Notification::assertSentTo($this->candidate, OfferingSent::class, function ($notification) {
            return $notification->jobListing->id === $this->jobListing->id && $notification->notes === 'Sending offering letter.';
        });
    }

    public function test_rejecting_stage_triggers_application_status_changed()
    {
        Notification::fake();

        $application = Application::create([
            'candidate_id' => $this->candidate->id,
            'job_listing_id' => $this->jobListing->id,
            'current_stage' => 'apply',
            'current_status' => 'in_progress',
            'applied_at' => now(),
        ]);

        ApplicationStage::create([
            'application_id' => $application->id,
            'stage_name' => 'apply',
            'status' => 'in_progress',
            'actioned_at' => now(),
        ]);

        $this->actingAs($this->hrUser, 'hr');

        $response = $this->post(route('hr.pipeline.reject', $application->id), [
            'rejection_reason' => 'Not matching qualifications',
            'notes' => 'Some private notes'
        ]);

        $response->assertRedirect();
        
        Notification::assertSentTo($this->candidate, ApplicationStatusChanged::class, function ($notification) {
            return $notification->stageName === 'apply' && $notification->status === 'failed';
        });
    }

    public function test_updating_status_triggers_notifications()
    {
        Notification::fake();

        $application = Application::create([
            'candidate_id' => $this->candidate->id,
            'job_listing_id' => $this->jobListing->id,
            'current_stage' => 'interview_hr',
            'current_status' => 'in_progress',
            'applied_at' => now(),
        ]);

        ApplicationStage::create([
            'application_id' => $application->id,
            'stage_name' => 'interview_hr',
            'status' => 'in_progress',
            'actioned_at' => now(),
        ]);

        $this->actingAs($this->hrUser, 'hr');

        // Test rescheduling interview
        $response = $this->post(route('hr.pipeline.status', $application->id), [
            'status' => 'rescheduled',
            'notes' => 'Rescheduled to 2 PM'
        ]);

        $response->assertRedirect();
        
        Notification::assertSentTo($this->candidate, InterviewScheduled::class, function ($notification) {
            return $notification->stageName === 'interview_hr' && $notification->scheduleNotes === 'Rescheduled to 2 PM';
        });

        // Test no_show status update
        $response = $this->post(route('hr.pipeline.status', $application->id), [
            'status' => 'no_show',
            'notes' => 'Candidate did not show up'
        ]);

        $response->assertRedirect();

        Notification::assertSentTo($this->candidate, ApplicationStatusChanged::class, function ($notification) {
            return $notification->stageName === 'interview_hr' && $notification->status === 'no_show';
        });
    }
}
