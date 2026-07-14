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

            // Personal & Domicile
            'birth_place' => 'Jakarta',
            'religion' => 'Islam',
            'blood_type' => 'O',
            'height' => 175,
            'weight' => 70,
            'address_domicile' => 'Jl. Kebagusan Raya No. 45, Jakarta Selatan',
            'phone_domicile' => '0217894561',
            'housing_status' => 'Milik Sendiri',
            'npwp' => '12.345.678.9-012.000',
            'bank_name' => 'BCA',
            'bank_account_number' => '8801234567',

            // Family details
            'father_name' => 'Achmad Santoso',
            'father_birth_place_date' => 'Surabaya, 1970-08-20',
            'father_job' => 'Pensiunan',
            'mother_birth_place_date' => 'Solo, 1975-12-10',
            'mother_job' => 'Ibu Rumah Tangga',
            'sibling_order' => 1,
            'sibling_count' => 2,
            'marital_status' => 'nikah',
            'spouse_name' => 'Rini Astuti',
            'spouse_birth_place_date' => 'Bandung, 2000-02-14',
            'child_1_name' => 'Dian Santoso',
            'child_1_birth_place_date' => 'Jakarta, 2024-03-01',

            // Education & Experience
            'school_name_city' => 'Universitas Indonesia, Depok',
            'school_major' => 'Teknik Informatika',
            'school_graduation_year' => 2020,
            'work_experience' => [
                [
                    'company' => 'PT Teknologi Jaya',
                    'position' => 'Software Engineer',
                    'period' => '2020-2023',
                    'last_salary' => '10000000',
                    'resign_reason' => 'Mencari tantangan baru'
                ]
            ],

            // References & Emergency
            'reference_name' => 'Eko Prasetyo',
            'reference_relationship' => 'Mantan Atasan',
            'reference_phone' => '081299998888',
            'emergency_name' => 'Rini Astuti',
            'emergency_relationship' => 'Istri',
            'emergency_phone' => '081277776666',
            'emergency_address' => 'Jl. Kebagusan Raya No. 45, Jakarta Selatan',

            // Sizes
            'size_shoe' => 42,
            'size_uniform' => 'L',
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
