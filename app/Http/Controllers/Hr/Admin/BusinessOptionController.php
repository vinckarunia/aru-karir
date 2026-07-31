<?php

namespace App\Http\Controllers\Hr\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusinessOption;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BusinessOptionController extends Controller
{
    public function index()
    {
        return Inertia::render('Hr/Admin/Options/Index', [
            'groups' => BusinessOption::GROUPS,
            'options' => BusinessOption::orderBy('group')->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());
        $validated['sort_order'] ??= (BusinessOption::where('group', $validated['group'])->max('sort_order') ?? 0) + 1;
        $validated['is_active'] = true;
        BusinessOption::create($validated);

        return back()->with('success', 'Opsi berhasil ditambahkan.');
    }

    public function update(Request $request, BusinessOption $option)
    {
        $validated = $request->validate($this->rules($option));
        $option->update($validated);

        return back()->with('success', 'Opsi berhasil diperbarui.');
    }

    public function destroy(BusinessOption $option)
    {
        $option->update(['is_active' => false]);

        return back()->with('success', 'Opsi dinonaktifkan agar data lama tetap valid.');
    }

    private function rules(?BusinessOption $option = null): array
    {
        return [
            'group' => ['required', Rule::in(array_keys(BusinessOption::GROUPS))],
            'code' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z0-9_\\/.-]+$/', Rule::unique('business_options')->where('group', request('group'))->ignore($option?->id)],
            'label' => ['required', 'string', 'max:150'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'is_active' => [$option ? 'required' : 'sometimes', 'boolean'],
        ];
    }
}
