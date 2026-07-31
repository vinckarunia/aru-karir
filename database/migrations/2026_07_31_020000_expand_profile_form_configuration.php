<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidate_profile_fields', function (Blueprint $table) {
            $table->string('field_type')->change();
            $table->string('form_section')->default('custom')->after('field_type');
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->json('references')->nullable()->after('reference_phone');
            $table->json('emergency_contacts')->nullable()->after('emergency_address');
        });
    }

    public function down(): void
    {
        Schema::table('candidate_profile_fields', function (Blueprint $table) {
            $table->dropColumn('form_section');
        });
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn(['references', 'emergency_contacts']);
        });
    }
};
