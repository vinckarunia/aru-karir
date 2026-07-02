<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationStage;
use App\Models\JobListing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PipelineController extends Controller
{
    /**
     * View all applicants for a listing, grouped by stage.
     */
    public function index(string $jobListingId): Response
    {
        $job = JobListing::with('categories')->findOrFail($jobListingId);
        
        $applications = Application::where('job_listing_id', $jobListingId)
            ->with(['candidate'])
            ->orderBy('applied_at', 'desc')
            ->get();

        return Inertia::render('Hr/Pipeline/Index', [
            'job' => $job,
            'applications' => $applications,
        ]);
    }

    /**
     * Detailed view of a single application.
     */
    public function show(string $applicationId): Response
    {
        $application = Application::with([
            'candidate.fieldValues.profileField',
            'jobListing.categories',
            'stages.actionedBy',
        ])->findOrFail($applicationId);

        return Inertia::render('Hr/Pipeline/Show', [
            'application' => $application,
        ]);
    }

    /**
     * Move candidate to next stage.
     */
    public function advanceStage(Request $request, string $applicationId): RedirectResponse
    {
        $application = Application::findOrFail($applicationId);
        
        $stages = ['apply', 'screening', 'interview_hr', 'interview_client', 'offering', 'onboarding'];
        $currentIndex = array_search($application->current_stage, $stages);
        
        if ($currentIndex === false) {
            return back()->with('error', 'Tahapan tidak valid.');
        }

        $isTransitionedToPassed = false;

        DB::transaction(function () use ($application, $stages, $currentIndex, $request, &$isTransitionedToPassed) {
            // Update current stage record
            ApplicationStage::where('application_id', $application->id)
                ->where('stage_name', $application->current_stage)
                ->where('status', 'in_progress')
                ->update([
                    'status' => 'passed',
                    'notes' => $request->input('notes'),
                    'actioned_by' => auth('hr')->id(),
                    'actioned_at' => now(),
                ]);

            if ($currentIndex < count($stages) - 1) {
                $nextStage = $stages[$currentIndex + 1];
                
                $application->update([
                    'current_stage' => $nextStage,
                    'current_status' => 'in_progress',
                ]);

                ApplicationStage::create([
                    'application_id' => $application->id,
                    'stage_name' => $nextStage,
                    'status' => 'in_progress',
                    'actioned_at' => now(),
                ]);
            } else {
                // If it was already onboarding, it is now completed/passed
                $application->update([
                    'current_status' => 'passed',
                ]);
                $isTransitionedToPassed = true;
            }
        });

        $candidate = $application->candidate;
        $jobListing = $application->jobListing;

        if ($isTransitionedToPassed) {
            // Reload relationships needed for payload
            $application->load(['candidate.fieldValues.profileField', 'jobListing']);
            $apiService = app(\App\Services\HrisApiService::class);
            $synced = $apiService->createDataRequest($application);

            // Notify HRIS Onboarding HR Team
            \Illuminate\Support\Facades\Notification::route('mail', config('hris.hr_email', 'admin@aru.co.id'))
                ->notify(new \App\Notifications\OnboardingTriggered($application->candidate, $application->jobListing));

            if ($synced) {
                return back()->with('success', 'Berhasil meloloskan kandidat dan sinkronisasi data onboarding ke HRIS berhasil.');
            } else {
                return back()->with('warning', 'Berhasil meloloskan kandidat, namun sinkronisasi data onboarding ke HRIS gagal. Silakan periksa log sistem.');
            }
        } else {
            $nextStage = $application->current_stage;
            $notes = $request->input('notes');

            if ($nextStage === 'interview_hr' || $nextStage === 'interview_client') {
                $candidate->notify(new \App\Notifications\InterviewScheduled($candidate, $jobListing, $nextStage, $notes));
            } elseif ($nextStage === 'offering') {
                $candidate->notify(new \App\Notifications\OfferingSent($candidate, $jobListing, $notes));
            } else {
                $candidate->notify(new \App\Notifications\ApplicationStatusChanged($candidate, $jobListing, $nextStage, 'passed', $notes));
            }
        }

        return back()->with('success', 'Berhasil melanjutkan kandidat ke tahapan berikutnya.');
    }

    /**
     * Mark application as failed at the current stage with a rejection reason.
     */
    public function rejectStage(Request $request, string $applicationId): RedirectResponse
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
            'notes' => 'nullable|string|max:1000',
        ]);

        $application = Application::findOrFail($applicationId);

        DB::transaction(function () use ($application, $request) {
            // Update application
            $application->update([
                'current_status' => 'failed',
            ]);

            // Update current stage record
            ApplicationStage::where('application_id', $application->id)
                ->where('stage_name', $application->current_stage)
                ->where('status', 'in_progress')
                ->update([
                    'status' => 'failed',
                    'rejection_reason' => $request->input('rejection_reason'),
                    'notes' => $request->input('notes'),
                    'actioned_by' => auth('hr')->id(),
                    'actioned_at' => now(),
                ]);
        });

        $application->load(['candidate', 'jobListing']);
        $application->candidate->notify(new \App\Notifications\ApplicationStatusChanged(
            $application->candidate,
            $application->jobListing,
            $application->current_stage,
            'failed',
            $request->input('rejection_reason') . ($request->input('notes') ? "\n" . $request->input('notes') : '')
        ));

        return back()->with('success', 'Kandidat telah ditolak pada tahapan ' . $application->current_stage);
    }

    /**
     * Update candidate status at the current stage.
     */
    public function updateStatus(Request $request, string $applicationId): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:in_progress,no_show,rescheduled,withdrawn',
            'notes' => 'nullable|string|max:1000',
        ]);

        $application = Application::findOrFail($applicationId);

        DB::transaction(function () use ($application, $request) {
            $status = $request->input('status');
            
            // Update application
            $application->update([
                'current_status' => $status,
            ]);

            // Update current stage record
            ApplicationStage::where('application_id', $application->id)
                ->where('stage_name', $application->current_stage)
                ->where('status', 'in_progress')
                ->update([
                    'status' => $status,
                    'notes' => $request->input('notes'),
                    'actioned_by' => auth('hr')->id(),
                    'actioned_at' => now(),
                ]);
        });

        $application->load(['candidate', 'jobListing']);
        $status = $request->input('status');
        $notes = $request->input('notes');

        if ($status === 'rescheduled' && ($application->current_stage === 'interview_hr' || $application->current_stage === 'interview_client')) {
            $application->candidate->notify(new \App\Notifications\InterviewScheduled(
                $application->candidate,
                $application->jobListing,
                $application->current_stage,
                $notes
            ));
        } elseif ($status === 'no_show' || $status === 'withdrawn') {
            $application->candidate->notify(new \App\Notifications\ApplicationStatusChanged(
                $application->candidate,
                $application->jobListing,
                $application->current_stage,
                $status,
                $notes
            ));
        }

        return back()->with('success', 'Status kandidat berhasil diperbarui.');
    }

    /**
     * Add an internal note to the current stage record.
     */
    public function addNote(Request $request, string $applicationId): RedirectResponse
    {
        $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        $application = Application::findOrFail($applicationId);

        // Find current stage record
        $stageRecord = ApplicationStage::where('application_id', $application->id)
            ->where('stage_name', $application->current_stage)
            ->where('status', 'in_progress')
            ->firstOrFail();

        // Append to existing notes
        $oldNotes = $stageRecord->notes;
        $newNotes = $oldNotes ? ($oldNotes . "\n---\n" . $request->input('notes')) : $request->input('notes');

        $stageRecord->update([
            'notes' => $newNotes,
            'actioned_by' => auth('hr')->id(),
            'actioned_at' => now(),
        ]);

        return back()->with('success', 'Catatan berhasil ditambahkan.');
    }

    /**
     * Handle bulk operations for multiple applications.
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $request->validate([
            'application_ids' => 'required|array|min:1',
            'application_ids.*' => 'exists:applications,id',
            'action_type' => 'required|in:advance,reject',
            'rejection_reason' => 'required_if:action_type,reject|nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000',
        ]);

        $ids = $request->input('application_ids');
        $action = $request->input('action_type');
        $rejectionReason = $request->input('rejection_reason');
        $notes = $request->input('notes');

        $stages = ['apply', 'screening', 'interview_hr', 'interview_client', 'offering', 'onboarding'];

        $passedApplicationIds = [];
        $notificationsToSend = [];

        DB::transaction(function () use ($ids, $action, $stages, $rejectionReason, $notes, &$passedApplicationIds, &$notificationsToSend) {
            foreach ($ids as $id) {
                $application = Application::findOrFail($id);

                if ($action === 'advance') {
                    $currentIndex = array_search($application->current_stage, $stages);
                    if ($currentIndex === false) continue;

                    // Update current stage record
                    ApplicationStage::where('application_id', $application->id)
                        ->where('stage_name', $application->current_stage)
                        ->where('status', 'in_progress')
                        ->update([
                            'status' => 'passed',
                            'notes' => $notes,
                            'actioned_by' => auth('hr')->id(),
                            'actioned_at' => now(),
                        ]);

                    if ($currentIndex < count($stages) - 1) {
                        $nextStage = $stages[$currentIndex + 1];
                        
                        $application->update([
                            'current_stage' => $nextStage,
                            'current_status' => 'in_progress',
                        ]);

                        ApplicationStage::create([
                            'application_id' => $application->id,
                            'stage_name' => $nextStage,
                            'status' => 'in_progress',
                            'actioned_at' => now(),
                        ]);

                        $notificationsToSend[] = [
                            'candidate' => $application->candidate,
                            'type' => 'advance',
                            'next_stage' => $nextStage,
                            'job_listing' => $application->jobListing,
                            'notes' => $notes,
                        ];
                    } else {
                        $application->update([
                            'current_status' => 'passed',
                        ]);
                        $passedApplicationIds[] = $application->id;
                    }
                } elseif ($action === 'reject') {
                    $application->update([
                        'current_status' => 'failed',
                    ]);

                    ApplicationStage::where('application_id', $application->id)
                        ->where('stage_name', $application->current_stage)
                        ->where('status', 'in_progress')
                        ->update([
                            'status' => 'failed',
                            'rejection_reason' => $rejectionReason,
                            'notes' => $notes,
                            'actioned_by' => auth('hr')->id(),
                            'actioned_at' => now(),
                        ]);

                    $notificationsToSend[] = [
                        'candidate' => $application->candidate,
                        'type' => 'reject',
                        'current_stage' => $application->current_stage,
                        'job_listing' => $application->jobListing,
                        'rejection_reason' => $rejectionReason,
                        'notes' => $notes,
                    ];
                }
            }
        });

        // Dispatch bulk notifications after transaction commits
        foreach ($notificationsToSend as $notif) {
            $candidate = $notif['candidate'];
            $jobListing = $notif['job_listing'];

            if ($notif['type'] === 'advance') {
                $nextStage = $notif['next_stage'];
                $notes = $notif['notes'];
                if ($nextStage === 'interview_hr' || $nextStage === 'interview_client') {
                    $candidate->notify(new \App\Notifications\InterviewScheduled($candidate, $jobListing, $nextStage, $notes));
                } elseif ($nextStage === 'offering') {
                    $candidate->notify(new \App\Notifications\OfferingSent($candidate, $jobListing, $notes));
                } else {
                    $candidate->notify(new \App\Notifications\ApplicationStatusChanged($candidate, $jobListing, $nextStage, 'passed', $notes));
                }
            } elseif ($notif['type'] === 'reject') {
                $candidate->notify(new \App\Notifications\ApplicationStatusChanged(
                    $candidate,
                    $jobListing,
                    $notif['current_stage'],
                    'failed',
                    $notif['rejection_reason'] . ($notif['notes'] ? "\n" . $notif['notes'] : '')
                ));
            }
        }

        // Trigger HRIS Sync for onboarding candidates that successfully transitioned to 'passed' status
        $syncErrors = 0;
        if (!empty($passedApplicationIds)) {
            $apiService = app(\App\Services\HrisApiService::class);
            foreach ($passedApplicationIds as $appId) {
                $app = Application::with(['candidate.fieldValues.profileField', 'jobListing'])->find($appId);
                if ($app) {
                    $synced = $apiService->createDataRequest($app);
                    if (!$synced) {
                        $syncErrors++;
                    }

                    // Notify HRIS Onboarding HR Team
                    \Illuminate\Support\Facades\Notification::route('mail', config('hris.hr_email', 'admin@aru.co.id'))
                        ->notify(new \App\Notifications\OnboardingTriggered($app->candidate, $app->jobListing));
                }
            }
        }

        if ($syncErrors > 0) {
            $successfulSyncs = count($passedApplicationIds) - $syncErrors;
            return back()->with('warning', "Aksi massal berhasil diproses untuk " . count($ids) . " kandidat. Namun, {$syncErrors} sinkronisasi data onboarding ke HRIS gagal (Berhasil: {$successfulSyncs}). Silakan periksa log sistem.");
        }

        if (!empty($passedApplicationIds)) {
            return back()->with('success', "Aksi massal berhasil diproses untuk " . count($ids) . " kandidat dan " . count($passedApplicationIds) . " data onboarding berhasil disinkronkan ke HRIS.");
        }

        return back()->with('success', 'Aksi massal berhasil diproses untuk ' . count($ids) . ' kandidat.');
    }
}
