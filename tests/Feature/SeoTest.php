<?php

namespace Tests\Feature;

use App\Models\HrUser;
use App\Models\JobListing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase;

    protected HrUser $hrUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hrUser = HrUser::create([
            'name' => 'Recruiter',
            'email' => 'recruiter@example.com',
            'password' => bcrypt('password'),
            'role' => 'hr',
        ]);
    }

    protected function tearDown(): void
    {
        // Clean up any generated static files
        if (File::exists(public_path('sitemap.xml'))) {
            File::delete(public_path('sitemap.xml'));
        }
        if (File::exists(public_path('robots.txt'))) {
            File::delete(public_path('robots.txt'));
        }

        parent::tearDown();
    }

    public function test_dynamic_sitemap_xml_returns_correct_response_structure(): void
    {
        // Create an active job listing
        $job = JobListing::create([
            'title' => 'Software Engineer PHP',
            'slug' => 'software-engineer-php',
            'description' => 'PHP coding',
            'requirements' => 'Laravel experience',
            'location' => 'Jakarta',
            'contract_type' => 'pkwt',
            'salary_visible' => false,
            'status' => 'published',
            'created_by' => $this->hrUser->id,
            'deadline_at' => now()->addDays(10),
        ]);

        $response = $this->get('/sitemap.xml');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/xml');
        
        $content = $response->getContent();
        $this->assertStringContainsString('<urlset', $content);
        $this->assertStringContainsString('<loc>' . url('/') . '</loc>', $content);
        $this->assertStringContainsString('<loc>' . route('job.detail', $job->slug) . '</loc>', $content);
    }

    public function test_dynamic_robots_txt_returns_correct_response_structure(): void
    {
        $response = $this->get('/robots.txt');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        
        $content = $response->getContent();
        $this->assertStringContainsString('User-agent: *', $content);
        $this->assertStringContainsString('Disallow: /kandidat/profil', $content);
        $this->assertStringContainsString('Disallow: /hr', $content);
        $this->assertStringContainsString('Sitemap: ' . url('sitemap.xml'), $content);
    }

    public function test_artisan_sitemap_generate_command_creates_files(): void
    {
        // Make sure files don't exist before running the command
        if (File::exists(public_path('sitemap.xml'))) {
            File::delete(public_path('sitemap.xml'));
        }
        if (File::exists(public_path('robots.txt'))) {
            File::delete(public_path('robots.txt'));
        }

        $job = JobListing::create([
            'title' => 'DevOps Engineer',
            'slug' => 'devops-engineer',
            'description' => 'Manage servers',
            'requirements' => 'AWS experience',
            'location' => 'Jakarta',
            'contract_type' => 'pkwt',
            'salary_visible' => false,
            'status' => 'published',
            'created_by' => $this->hrUser->id,
            'deadline_at' => now()->addDays(5),
        ]);

        // Run the artisan command
        $this->artisan('sitemap:generate')
            ->assertExitCode(0);

        // Assert files exist
        $this->assertTrue(File::exists(public_path('sitemap.xml')));
        $this->assertTrue(File::exists(public_path('robots.txt')));

        // Assert file contents
        $sitemapContent = File::get(public_path('sitemap.xml'));
        $this->assertStringContainsString('<urlset', $sitemapContent);
        $this->assertStringContainsString('<loc>' . route('job.detail', $job->slug) . '</loc>', $sitemapContent);

        $robotsContent = File::get(public_path('robots.txt'));
        $this->assertStringContainsString('User-agent: *', $robotsContent);
        $this->assertStringContainsString('Sitemap: ' . url('sitemap.xml'), $robotsContent);
    }
}
