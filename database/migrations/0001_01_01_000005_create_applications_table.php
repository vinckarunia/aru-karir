<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('candidate_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('job_listing_id')->constrained()->cascadeOnDelete();
            $table->enum('current_stage', [
                'apply', 'screening', 'interview_hr',
                'interview_client', 'offering', 'onboarding',
            ])->default('apply');
            $table->enum('current_status', [
                'in_progress', 'passed', 'failed',
                'no_show', 'rescheduled', 'withdrawn',
            ])->default('in_progress');
            $table->timestamp('applied_at');
            $table->timestamps();

            $table->unique(['candidate_id', 'job_listing_id']);
        });

        Schema::create('application_stages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->constrained()->cascadeOnDelete();
            $table->enum('stage_name', [
                'apply', 'screening', 'interview_hr',
                'interview_client', 'offering', 'onboarding',
            ]);
            $table->enum('status', [
                'in_progress', 'passed', 'failed',
                'no_show', 'rescheduled', 'withdrawn',
            ]);
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignUuid('actioned_by')->nullable()->constrained('hr_users')->nullOnDelete();
            $table->timestamp('actioned_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_stages');
        Schema::dropIfExists('applications');
    }
};
