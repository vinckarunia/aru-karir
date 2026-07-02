<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobListing;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display HR dashboard with stats and recent applications.
     */
    public function index(): Response
    {
        $activeListingsCount = JobListing::where('status', 'published')->count();
        $totalApplicationsCount = Application::count();
        $newApplicationsCount = Application::where('created_at', '>=', Carbon::today())->count();
        $acceptedCandidatesCount = Application::where('current_stage', 'onboarding')
            ->where('current_status', 'passed')
            ->count();

        $recentApplications = Application::with(['candidate', 'jobListing'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Hr/Dashboard', [
            'stats' => [
                'active_listings' => $activeListingsCount,
                'total_applications' => $totalApplicationsCount,
                'new_applications' => $newApplicationsCount,
                'accepted_candidates' => $acceptedCandidatesCount,
            ],
            'recentApplications' => $recentApplications,
        ]);
    }
}
