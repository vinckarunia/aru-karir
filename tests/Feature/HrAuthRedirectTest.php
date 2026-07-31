<?php

namespace Tests\Feature;

use App\Models\HrUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HrAuthRedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_visiting_hr_root_is_redirected_to_hr_login(): void
    {
        $this->get('/hr')
            ->assertRedirect(route('hr.login'));
    }

    public function test_authenticated_hr_user_visiting_hr_root_is_redirected_to_dashboard(): void
    {
        $hrUser = HrUser::create([
            'name' => 'HR Staff',
            'email' => 'hr@example.com',
            'password' => bcrypt('password'),
            'role' => 'hr',
        ]);

        $this->actingAs($hrUser, 'hr')
            ->get('/hr')
            ->assertRedirect(route('hr.dashboard'));
    }

    public function test_authenticated_hr_user_cannot_be_redirected_to_public_home_from_login(): void
    {
        $hrUser = HrUser::create([
            'name' => 'HR Staff',
            'email' => 'hr@example.com',
            'password' => bcrypt('password'),
            'role' => 'hr',
        ]);

        $this->actingAs($hrUser, 'hr')
            ->get(route('hr.login'))
            ->assertRedirect(route('hr.dashboard'));
    }
}
