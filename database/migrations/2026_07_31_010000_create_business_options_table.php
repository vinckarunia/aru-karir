<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_options', function (Blueprint $table) {
            $table->id();
            $table->string('group');
            $table->string('code');
            $table->string('label');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['group', 'code']);
            $table->index(['group', 'is_active', 'sort_order']);
        });

        $defaults = [
            'contract_type' => ['pkwt' => 'PKWT (Kontrak)', 'pkwtt' => 'PKWTT (Karyawan Tetap)', 'freelance' => 'Freelance'],
            'gender' => ['male' => 'Laki-laki', 'female' => 'Perempuan'],
            'religion' => ['Islam' => 'Islam', 'Kristen' => 'Kristen', 'Katolik' => 'Katolik', 'Hindu' => 'Hindu', 'Budha' => 'Budha', 'Konghucu' => 'Konghucu', 'Lainnya' => 'Lainnya'],
            'blood_type' => ['A' => 'A', 'B' => 'B', 'AB' => 'AB', 'O' => 'O'],
            'uniform_size' => ['S' => 'S', 'M' => 'M', 'L' => 'L', 'XL' => 'XL', 'XXL' => 'XXL', 'XXXL' => 'XXXL'],
            'marital_status' => ['belum_nikah' => 'Belum Menikah', 'nikah' => 'Menikah', 'duda' => 'Duda', 'janda' => 'Janda'],
            'education_level' => ['SD' => 'SD', 'SMP' => 'SMP', 'SMA/SMK' => 'SMA/SMK / Sederajat', 'D1/D2/D3' => 'Diploma (D1/D2/D3)', 'S1' => 'Sarjana (S1)', 'S2' => 'Magister (S2)', 'S3' => 'Doktor (S3)'],
        ];

        $now = now();
        foreach ($defaults as $group => $options) {
            $sortOrder = 1;
            foreach ($options as $code => $label) {
                DB::table('business_options')->insert([
                    'group' => $group,
                    'code' => $code,
                    'label' => $label,
                    'sort_order' => $sortOrder++,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        Schema::table('job_listings', function (Blueprint $table) {
            $table->string('contract_type')->change();
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->string('gender')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_options');
    }
};
