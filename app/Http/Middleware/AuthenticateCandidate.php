<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateCandidate
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('candidate')->check()) {
            // Store intended URL so we can redirect back after login
            session()->put('url.intended', $request->url());
            return redirect()->route('candidate.login');
        }

        return $next($request);
    }
}
