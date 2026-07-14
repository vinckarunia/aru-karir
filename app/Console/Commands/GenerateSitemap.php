<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\JobListing;
use Illuminate\Support\Facades\File;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate static sitemap.xml and robots.txt files in the public directory';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating sitemap.xml...');

        $jobs = JobListing::active()->orderBy('updated_at', 'desc')->get();

        // 1. Generate sitemap.xml
        $sitemapContent = view('seo.sitemap', [
            'jobs' => $jobs,
        ])->render();

        $sitemapPath = public_path('sitemap.xml');
        File::put($sitemapPath, $sitemapContent);
        $this->info("Sitemap generated successfully at: {$sitemapPath}");

        // 2. Generate robots.txt
        $this->info('Generating robots.txt...');
        $robotsContent = view('seo.robots')->render();

        $robotsPath = public_path('robots.txt');
        File::put($robotsPath, $robotsContent);
        $this->info("Robots.txt generated successfully at: {$robotsPath}");

        return 0;
    }
}
