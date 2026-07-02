<?php

namespace Database\Seeders;

use App\Models\JobCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class JobCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Teknisi',
            'Operator',
            'Staff Admin',
            'Security',
            'Cleaning Service',
            'Driver',
            'Helper',
            'Supervisor',
            'Koordinator',
            'IT Support',
        ];

        foreach ($categories as $name) {
            JobCategory::create([
                'name' => $name,
                'slug' => Str::slug($name),
            ]);
        }
    }
}
