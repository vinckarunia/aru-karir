<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateHr
{
    public function handle(Request $request, Closure $next, ?string $role = null): Response
    {
        if (!Auth::guard('hr')->check()) {
            return redirect()->route('hr.login');
        }

        // Optional role check (e.g., 'admin')
        if ($role && Auth::guard('hr')->user()->role !== $role) {
            abort(403, 'Unauthorized.');
        }

        return $next($request);
    }
}
