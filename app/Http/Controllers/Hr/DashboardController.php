<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobListing;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display HR dashboard with stats and unread applications.
     */
    public function index(): Response
    {
        $activeListingsCount = JobListing::where('status', 'published')->count();
        $totalApplicationsCount = Application::count();
        $unreadApplicationsCount = Application::whereNull('viewed_at')->count();
        $acceptedCandidatesCount = Application::where('current_stage', 'onboarding')
            ->where('current_status', 'passed')
            ->count();

        $unreadApplications = Application::with(['candidate', 'jobListing'])
            ->whereNull('viewed_at')
            ->orderByDesc('applied_at')
            ->get();

        return Inertia::render('Hr/Dashboard', [
            'stats' => [
                'active_listings' => $activeListingsCount,
                'total_applications' => $totalApplicationsCount,
                'unread_applications' => $unreadApplicationsCount,
                'accepted_candidates' => $acceptedCandidatesCount,
            ],
            'unreadApplications' => $unreadApplications,
        ]);
    }
}
