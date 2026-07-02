<?php

namespace App\Http\Controllers;

use App\Models\JobCategory;
use App\Models\JobListing;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class JobListingController extends Controller
{
    /**
     * Display public job listing with search and filters.
     */
    public function publicIndex(Request $request): Response
    {
        $query = JobListing::active()->with('categories');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $categorySlug = $request->input('category');
            $query->whereHas('categories', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if ($request->filled('contract_type')) {
            $query->where('contract_type', $request->input('contract_type'));
        }

        if ($request->filled('location')) {
            $query->where('location', $request->input('location'));
        }

        // Get paginated active job listings
        $listings = $query->latest()->paginate(9)->withQueryString();

        // Get categories for filter dropdown
        $categories = JobCategory::orderBy('name')->get();

        // Get unique locations from active listings for filter dropdown
        $locations = JobListing::active()
            ->distinct()
            ->pluck('location')
            ->filter()
            ->values();

        return Inertia::render('Public/JobIndex', [
            'listings' => $listings,
            'categories' => $categories,
            'locations' => $locations,
            'filters' => $request->only(['search', 'category', 'contract_type', 'location']),
        ]);
    }

    /**
     * Display details of a public job listing.
     */
    public function publicShow(string $slug): Response
    {
        $job = JobListing::with(['categories', 'creator'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Prevent viewing drafts/closed jobs unless authenticated as HR
        if ($job->status !== 'published' && !auth('hr')->check()) {
            abort(404);
        }

        return Inertia::render('Public/JobDetail', [
            'job' => $job,
        ]);
    }

    /**
     * Display a listing of jobs for HR.
     */
    public function index(): Response
    {
        $listings = JobListing::with('categories')
            ->withCount('applications')
            ->latest()
            ->paginate(15);

        return Inertia::render('Hr/JobListing/Index', [
            'listings' => $listings,
        ]);
    }

    /**
     * Show form to create a new job listing.
     */
    public function create(): Response
    {
        $categories = JobCategory::orderBy('name')->get();

        return Inertia::render('Hr/JobListing/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a new job listing.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'required|string',
            'location' => 'required|string|max:255',
            'contract_type' => 'required|in:pkwt,pkwtt,freelance',
            'salary_range_min' => 'nullable|integer|min:0',
            'salary_range_max' => 'nullable|integer|min:0|gte:salary_range_min',
            'salary_visible' => 'required|boolean',
            'quota' => 'nullable|integer|min:1',
            'deadline_at' => 'nullable|date|after:today',
            'categories' => 'required|array|min:1',
            'categories.*' => 'exists:job_categories,id',
            'hris_project_id' => 'nullable|string|max:255',
            'status' => 'required|in:draft,published,closed',
        ]);

        // Generate unique slug
        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $count = 1;
        while (JobListing::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-" . $count++;
        }

        $validated['slug'] = $slug;
        $validated['created_by'] = auth('hr')->id();

        $listing = JobListing::create($validated);
        $listing->categories()->attach($validated['categories']);

        return redirect()->route('hr.lowongan.index')
            ->with('success', 'Lowongan pekerjaan berhasil dibuat.');
    }

    /**
     * Show form to edit a job listing.
     */
    public function edit(string $id): Response
    {
        $job = JobListing::with('categories')->findOrFail($id);
        $categories = JobCategory::orderBy('name')->get();

        return Inertia::render('Hr/JobListing/Edit', [
            'job' => $job,
            'categories' => $categories,
        ]);
    }

    /**
     * Update a job listing.
     */
    public function update(Request $request, string $id)
    {
        $listing = JobListing::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'required|string',
            'location' => 'required|string|max:255',
            'contract_type' => 'required|in:pkwt,pkwtt,freelance',
            'salary_range_min' => 'nullable|integer|min:0',
            'salary_range_max' => 'nullable|integer|min:0|gte:salary_range_min',
            'salary_visible' => 'required|boolean',
            'quota' => 'nullable|integer|min:1',
            'deadline_at' => 'nullable|date|after:today',
            'categories' => 'required|array|min:1',
            'categories.*' => 'exists:job_categories,id',
            'hris_project_id' => 'nullable|string|max:255',
            'status' => 'required|in:draft,published,closed',
        ]);

        // Re-generate slug if title changed
        if ($listing->title !== $validated['title']) {
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $count = 1;
            while (JobListing::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = "{$originalSlug}-" . $count++;
            }
            $validated['slug'] = $slug;
        }

        $listing->update($validated);
        $listing->categories()->sync($validated['categories']);

        return redirect()->route('hr.lowongan.index')
            ->with('success', 'Lowongan pekerjaan berhasil diperbarui.');
    }

    /**
     * Toggle or update the status of a job listing.
     */
    public function toggleStatus(Request $request, string $id)
    {
        $listing = JobListing::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:draft,published,closed',
        ]);

        $listing->update([
            'status' => $validated['status'],
        ]);

        return redirect()->back()
            ->with('success', 'Status lowongan berhasil diperbarui.');
    }
}
