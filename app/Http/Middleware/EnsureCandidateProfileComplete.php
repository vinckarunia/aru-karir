<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureCandidateProfileComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $candidate = Auth::guard('candidate')->user();

        if ($candidate && !$candidate->is_profile_complete) {
            // Allow access to profile edit page itself
            if ($request->routeIs('candidate.profile.*')) {
                return $next($request);
            }

            return redirect()->route('candidate.profile.edit')
                ->with('warning', 'Silakan lengkapi profil Anda terlebih dahulu.');
        }

        return $next($request);
    }
}
