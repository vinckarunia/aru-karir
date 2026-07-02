<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\JobListing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Display the login view.
     */
    public function showLogin(Request $request): Response
    {
        return Inertia::render('Candidate/Auth/Login', [
            'job' => $request->query('job'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (Auth::guard('candidate')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $candidate = Auth::guard('candidate')->user();

            // Check if there is an intended job
            $intendedJobSlug = $request->input('job');
            if ($intendedJobSlug) {
                $job = JobListing::where('slug', $intendedJobSlug)->first();
                if ($job) {
                    if ($candidate->is_profile_complete) {
                        return redirect()->route('job.detail', $job->slug)
                            ->with('success', 'Berhasil masuk! Silakan kirim lamaran Anda.');
                    } else {
                        return redirect()->route('candidate.profile.edit', ['job' => $job->slug])
                            ->with('warning', 'Silakan lengkapi profil Anda terlebih dahulu.');
                    }
                }
            }

            return redirect()->intended(route('candidate.applications.index'));
        }

        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    /**
     * Display the registration view.
     */
    public function showRegister(Request $request): Response
    {
        return Inertia::render('Candidate/Auth/Register', [
            'job' => $request->query('job'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     */
    public function register(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|string|email|max:255|unique:candidates',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $candidate = Candidate::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Auth::guard('candidate')->login($candidate);

        $intendedJobSlug = $request->input('job');
        if ($intendedJobSlug) {
            $job = JobListing::where('slug', $intendedJobSlug)->first();
            if ($job) {
                return redirect()->route('candidate.profile.edit', ['job' => $job->slug])
                    ->with('info', 'Pendaftaran berhasil! Silakan lengkapi profil untuk melamar posisi ' . $job->title . '.');
            }
        }

        return redirect()->route('candidate.profile.edit')
            ->with('success', 'Akun berhasil terdaftar! Silakan lengkapi profil Anda.');
    }

    /**
     * Destroy an authenticated session.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('candidate')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    /**
     * Display the forgot password view.
     */
    public function showForgotPassword(): Response
    {
        return Inertia::render('Candidate/Auth/ForgotPassword');
    }

    /**
     * Handle forgot password request.
     */
    public function sendResetLink(Request $request): RedirectResponse
    {
        $request->validate(['email' => 'required|email']);

        $candidate = Candidate::where('email', $request->email)->first();

        if ($candidate) {
            // In dev mode we just generate a mock link and flash a success message.
            // This is clean, robust, and doesn't require SMTP.
            $token = Str::random(60);
            \Illuminate\Support\Facades\DB::table('candidate_password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                ['token' => Hash::make($token), 'created_at' => now()]
            );

            // Log the mock password reset link
            \Illuminate\Support\Facades\Log::info("Password reset link for {$request->email}: " . route('candidate.password.reset', ['token' => $token, 'email' => $request->email]));

            return back()->with('success', 'Link instruksi reset kata sandi telah dikirim ke email Anda (Silakan cek log aplikasi jika menggunakan mode lokal).');
        }

        return back()->withErrors(['email' => 'Email tidak ditemukan dalam sistem kami.']);
    }

    /**
     * Display the reset password view.
     */
    public function showResetPassword(Request $request, string $token): Response
    {
        return Inertia::render('Candidate/Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->query('email'),
        ]);
    }

    /**
     * Handle reset password submission.
     */
    public function resetPassword(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $reset = \Illuminate\Support\Facades\DB::table('candidate_password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if ($reset && Hash::check($request->token, $reset->token)) {
            $candidate = Candidate::where('email', $request->email)->first();
            if ($candidate) {
                $candidate->update([
                    'password' => Hash::make($request->password)
                ]);

                \Illuminate\Support\Facades\DB::table('candidate_password_reset_tokens')
                    ->where('email', $request->email)
                    ->delete();

                return redirect()->route('candidate.login')->with('success', 'Kata sandi Anda berhasil diperbarui. Silakan login.');
            }
        }

        return back()->withErrors(['email' => 'Token reset kata sandi tidak valid atau sudah kedaluwarsa.']);
    }
}
