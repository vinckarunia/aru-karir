<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationStage;
use App\Models\JobListing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    /**
     * Display a listing of candidate's applications.
     */
    public function index(): Response
    {
        $candidate = Auth::guard('candidate')->user();

        $applications = Application::where('candidate_id', $candidate->id)
            ->with(['jobListing.categories'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Candidate/Application/Index', [
            'applications' => $applications,
        ]);
    }

    /**
     * Submit a new job application.
     */
    public function store(Request $request, string $jobId): RedirectResponse
    {
        /** @var \App\Models\Candidate $candidate */
        $candidate = Auth::guard('candidate')->user();

        // 1. Ensure job listing exists and is active/published
        $jobListing = JobListing::where('id', $jobId)
            ->where('status', 'published')
            ->firstOrFail();

        // 2. Ensure profile is complete and satisfies required fields for this job
        if (!$candidate->is_profile_complete || !$candidate->satisfiesRequiredFields($jobListing)) {
            $slugParam = ['job' => $jobListing->slug];
            return redirect()->route('candidate.profile.edit', $slugParam)
                ->with('warning', 'Silakan lengkapi data profil yang wajib diisi terlebih dahulu untuk mengirim lamaran.');
        }

        // 3. Ensure candidate has not already applied to this job
        $existing = Application::where('candidate_id', $candidate->id)
            ->where('job_listing_id', $jobId)
            ->first();

        if ($existing) {
            return redirect()->back()->with('warning', 'Anda sudah mengirim lamaran untuk lowongan ini.');
        }

        // 4. Create the application and the initial stage record inside transaction
        DB::transaction(function () use ($candidate, $jobListing) {
            $application = Application::create([
                'candidate_id' => $candidate->id,
                'job_listing_id' => $jobListing->id,
                'current_stage' => 'apply',
                'current_status' => 'in_progress',
                'applied_at' => now(),
            ]);

            ApplicationStage::create([
                'application_id' => $application->id,
                'stage_name' => 'apply',
                'status' => 'in_progress',
                'actioned_at' => now(),
                'notes' => 'Lamaran dikirim oleh kandidat.',
            ]);
        });

        // 5. Dispatch notifications after transaction commits
        $candidate->notify(new \App\Notifications\ApplicationSubmitted($candidate, $jobListing));
        if ($jobListing->creator) {
            $jobListing->creator->notify(new \App\Notifications\NewApplicationReceived($candidate, $jobListing));
        }

        return redirect()->route('candidate.applications.index')
            ->with('success', 'Lamaran Anda untuk posisi ' . $jobListing->title . ' berhasil dikirim!');
    }

    /**
     * Display the specified application's pipeline timeline.
     */
    public function show(string $id): Response
    {
        $candidate = Auth::guard('candidate')->user();

        $application = Application::where('id', $id)
            ->where('candidate_id', $candidate->id)
            ->with(['jobListing.categories', 'stages' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }])
            ->firstOrFail();

        return Inertia::render('Candidate/Application/Show', [
            'application' => $application,
        ]);
    }
}
