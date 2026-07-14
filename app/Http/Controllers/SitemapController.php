<?php

namespace App\Http\Controllers;

use App\Models\JobListing;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate and serve sitemap.xml.
     */
    public function sitemap(): Response
    {
        $jobs = JobListing::active()->orderBy('updated_at', 'desc')->get();

        $content = view('seo.sitemap', [
            'jobs' => $jobs,
        ])->render();

        return response($content, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    /**
     * Generate and serve robots.txt.
     */
    public function robots(): Response
    {
        $content = view('seo.robots')->render();

        return response($content, 200, [
            'Content-Type' => 'text/plain',
        ]);
    }
}
