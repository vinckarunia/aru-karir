<?php

namespace Database\Seeders;

use App\Models\HrUser;
use Illuminate\Database\Seeder;

class HrUserSeeder extends Seeder
{
    public function run(): void
    {
        HrUser::create([
            'name' => 'Admin ARUKarir',
            'email' => 'admin@aru.co.id',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        HrUser::create([
            'name' => 'HR Recruiter',
            'email' => 'hr@aru.co.id',
            'password' => bcrypt('password'),
            'role' => 'hr',
        ]);
    }
}
