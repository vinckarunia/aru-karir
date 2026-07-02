<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\CandidateProfileField;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CandidateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Incomplete Candidate Profile (for testing manual profile completion)
        Candidate::create([
            'email' => 'kandidat@aru.co.id',
            'password' => Hash::make('password'),
        ]);

        // 2. Complete Candidate Profile (for testing direct application submission)
        Candidate::create([
            'email' => 'kandidat-lengkap@aru.co.id',
            'password' => Hash::make('password'),
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'birth_date' => '1998-05-15',
            'gender' => 'male',
            'ktp_number' => '1234567890123456',
            'mother_name' => 'Siti Aminah',
            'address' => 'Jl. Jenderal Sudirman No. 123, Jakarta Selatan',
            'education_level' => 'S1',
            'cv_path' => '/uploads/cv/mock_cv.pdf',
            'profile_completed_at' => now(),
        ]);

        // 3. Optional: Seed some custom profile fields
        CandidateProfileField::create([
            'field_name' => 'salary_expectation',
            'field_label' => 'Ekspektasi Gaji Bulanan (IDR)',
            'field_type' => 'text',
            'is_required' => true,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        CandidateProfileField::create([
            'field_name' => 'portfolio_url',
            'field_label' => 'Link Portofolio (GitHub/Behance)',
            'field_type' => 'text',
            'is_required' => false,
            'sort_order' => 2,
            'is_active' => true,
        ]);
        
        CandidateProfileField::create([
            'field_name' => 'willing_to_relocate',
            'field_label' => 'Bersedia Relokasi Luar Kota?',
            'field_type' => 'select',
            'options' => ['Ya, Bersedia', 'Tidak Bersedia', 'Hanya Kota Tertentu'],
            'is_required' => true,
            'sort_order' => 3,
            'is_active' => true,
        ]);
    }
}
