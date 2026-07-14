<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_listings', function (Blueprint $table) {
            $table->json('required_fields')->nullable()->after('hris_project_id');
        });
    }

    public function down(): void
    {
        Schema::table('job_listings', function (Blueprint $table) {
            $table->dropColumn('required_fields');
        });
    }
};
