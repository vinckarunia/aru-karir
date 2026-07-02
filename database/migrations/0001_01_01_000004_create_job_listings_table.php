<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('job_listings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('requirements');
            $table->string('location');
            $table->enum('contract_type', ['pkwt', 'pkwtt', 'freelance']);
            $table->unsignedInteger('salary_range_min')->nullable();
            $table->unsignedInteger('salary_range_max')->nullable();
            $table->boolean('salary_visible')->default(false);
            $table->string('hris_project_id')->nullable();
            $table->enum('status', ['draft', 'published', 'closed'])->default('draft');
            $table->unsignedInteger('quota')->nullable();
            $table->timestamp('deadline_at')->nullable();
            $table->foreignUuid('created_by')->constrained('hr_users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('job_listing_category', function (Blueprint $table) {
            $table->foreignUuid('job_listing_id')->constrained()->cascadeOnDelete();
            $table->foreignId('job_category_id')->constrained()->cascadeOnDelete();
            $table->primary(['job_listing_id', 'job_category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_listing_category');
        Schema::dropIfExists('job_listings');
        Schema::dropIfExists('job_categories');
    }
};
