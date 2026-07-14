<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->string('birth_place')->nullable();
            $table->string('religion')->nullable();
            $table->string('blood_type')->nullable();
            $table->integer('height')->nullable();
            $table->integer('weight')->nullable();
            $table->text('address_domicile')->nullable();
            $table->string('phone_domicile')->nullable();
            $table->string('housing_status')->nullable();
            $table->string('npwp')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_name')->nullable();
            
            // Family details
            $table->string('father_name')->nullable();
            $table->string('father_birth_place_date')->nullable();
            $table->string('father_job')->nullable();
            $table->string('mother_birth_place_date')->nullable();
            $table->string('mother_job')->nullable();
            $table->integer('sibling_order')->nullable();
            $table->integer('sibling_count')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('spouse_name')->nullable();
            $table->string('spouse_birth_place_date')->nullable();
            $table->string('child_1_name')->nullable();
            $table->string('child_1_birth_place_date')->nullable();
            $table->string('child_2_name')->nullable();
            $table->string('child_2_birth_place_date')->nullable();
            $table->string('child_3_name')->nullable();
            $table->string('child_3_birth_place_date')->nullable();
            
            // Education & Experience
            $table->string('school_name_city')->nullable();
            $table->string('school_major')->nullable();
            $table->integer('school_graduation_year')->nullable();
            $table->json('work_experience')->nullable();
            
            // References & Emergency Contacts
            $table->string('reference_name')->nullable();
            $table->string('reference_relationship')->nullable();
            $table->string('reference_phone')->nullable();
            $table->string('emergency_name')->nullable();
            $table->string('emergency_relationship')->nullable();
            $table->string('emergency_phone')->nullable();
            $table->text('emergency_address')->nullable();
            
            // Sizes
            $table->integer('size_shoe')->nullable();
            $table->string('size_uniform')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn([
                'birth_place',
                'religion',
                'blood_type',
                'height',
                'weight',
                'address_domicile',
                'phone_domicile',
                'housing_status',
                'npwp',
                'bank_account_number',
                'bank_name',
                'father_name',
                'father_birth_place_date',
                'father_job',
                'mother_birth_place_date',
                'mother_job',
                'sibling_order',
                'sibling_count',
                'marital_status',
                'spouse_name',
                'spouse_birth_place_date',
                'child_1_name',
                'child_1_birth_place_date',
                'child_2_name',
                'child_2_birth_place_date',
                'child_3_name',
                'child_3_birth_place_date',
                'school_name_city',
                'school_major',
                'school_graduation_year',
                'work_experience',
                'reference_name',
                'reference_relationship',
                'reference_phone',
                'emergency_name',
                'emergency_relationship',
                'emergency_phone',
                'emergency_address',
                'size_shoe',
                'size_uniform',
            ]);
        });
    }
};
