<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidate_profile_fields', function (Blueprint $table) {
            $table->id();
            $table->string('field_name')->unique();
            $table->string('field_label');
            $table->enum('field_type', ['text', 'textarea', 'file', 'select']);
            $table->boolean('is_required')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->json('options')->nullable(); // For select field type
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('candidate_field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('candidate_id')->constrained()->cascadeOnDelete();
            $table->foreignId('profile_field_id')->constrained('candidate_profile_fields')->cascadeOnDelete();
            $table->text('value')->nullable();
            $table->string('file_path')->nullable();
            $table->timestamps();

            $table->unique(['candidate_id', 'profile_field_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_field_values');
        Schema::dropIfExists('candidate_profile_fields');
    }
};
