<?php

namespace App\Http\Controllers\Hr\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class JobCategoryController extends Controller
{
    public function index()
    {
        $categories = JobCategory::withCount('jobListings')->orderBy('name')->get();

        return Inertia::render('Hr/Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:job_categories,name',
            'slug' => 'nullable|string|max:255|unique:job_categories,slug',
        ]);

        $slug = empty($validated['slug']) ? Str::slug($validated['name']) : Str::slug($validated['slug']);

        JobCategory::create([
            'name' => $validated['name'],
            'slug' => $slug,
        ]);

        return redirect()->back()->with('success', 'Kategori pekerjaan berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $category = JobCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:job_categories,name,' . $category->id,
            'slug' => 'nullable|string|max:255|unique:job_categories,slug,' . $category->id,
        ]);

        $slug = empty($validated['slug']) ? Str::slug($validated['name']) : Str::slug($validated['slug']);

        $category->update([
            'name' => $validated['name'],
            'slug' => $slug,
        ]);

        return redirect()->back()->with('success', 'Kategori pekerjaan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $category = JobCategory::findOrFail($id);
        $category->delete();

        return redirect()->back()->with('success', 'Kategori pekerjaan berhasil dihapus.');
    }
}
