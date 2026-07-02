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

        DB::transaction(function () use ($application, $stages, $currentIndex, $request) {
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
            }
        });

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

        DB::transaction(function () use ($ids, $action, $stages, $rejectionReason, $notes) {
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
                    } else {
                        $application->update([
                            'current_status' => 'passed',
                        ]);
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
                }
            }
        });

        return back()->with('success', 'Aksi massal berhasil diproses untuk ' . count($ids) . ' kandidat.');
    }
}
