<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show the HR login view.
     */
    public function showLogin(): Response
    {
        return Inertia::render('Hr/Auth/Login');
    }

    /**
     * Handle an incoming HR authentication request.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (Auth::guard('hr')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            return redirect()->intended(route('hr.dashboard'));
        }

        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    /**
     * Destroy an authenticated HR session.
     */
    public function logout(Request $request)
    {
        Auth::guard('hr')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('hr.login');
    }
}
