<?php

namespace App\Http\Controllers\Hr\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class HrUserController extends Controller
{
    public function index()
    {
        $users = HrUser::orderBy('name')->get();

        return Inertia::render('Hr/Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:hr_users,email',
            'role' => 'required|in:hr,admin',
            'password' => 'required|string|min:8',
        ]);

        HrUser::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->back()->with('success', 'Akun HR berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $user = HrUser::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:hr_users,email,' . $user->id,
            'role' => 'required|in:hr,admin',
            'password' => 'nullable|string|min:8',
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        return redirect()->back()->with('success', 'Akun HR berhasil diperbarui.');
    }

    public function destroy($id)
    {
        if ($id === Auth::guard('hr')->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user = HrUser::findOrFail($id);
        $user->delete();

        return redirect()->back()->with('success', 'Akun HR berhasil dihapus.');
    }
}
