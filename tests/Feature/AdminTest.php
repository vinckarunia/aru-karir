<?php

namespace Tests\Feature;

use App\Models\HrUser;
use App\Models\JobCategory;
use App\Models\CandidateProfileField;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected HrUser $admin;
    protected HrUser $hrUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = HrUser::create([
            'name' => 'Administrator',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $this->hrUser = HrUser::create([
            'name' => 'HR Staff',
            'email' => 'hr@example.com',
            'password' => bcrypt('password'),
            'role' => 'hr',
        ]);
    }

    public function test_guest_cannot_access_admin_routes()
    {
        $this->get(route('admin.users.index'))->assertRedirect(route('hr.login'));
        $this->get(route('admin.categories.index'))->assertRedirect(route('hr.login'));
        $this->get(route('admin.config.index'))->assertRedirect(route('hr.login'));
    }

    public function test_non_admin_hr_user_cannot_access_admin_routes()
    {
        $this->actingAs($this->hrUser, 'hr');

        $this->get(route('admin.users.index'))->assertStatus(403);
        $this->get(route('admin.categories.index'))->assertStatus(403);
        $this->get(route('admin.config.index'))->assertStatus(403);
    }

    public function test_admin_can_access_admin_routes()
    {
        $this->actingAs($this->admin, 'hr');

        $this->get(route('admin.users.index'))->assertStatus(200);
        $this->get(route('admin.categories.index'))->assertStatus(200);
        $this->get(route('admin.config.index'))->assertStatus(200);
    }

    public function test_admin_can_manage_hr_users()
    {
        $this->actingAs($this->admin, 'hr');

        // Store
        $response = $this->post(route('admin.users.store'), [
            'name' => 'New HR Staff',
            'email' => 'newhr@example.com',
            'role' => 'hr',
            'password' => 'secret123',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('hr_users', ['email' => 'newhr@example.com']);

        $newUser = HrUser::where('email', 'newhr@example.com')->first();

        // Update
        $response = $this->put(route('admin.users.update', $newUser->id), [
            'name' => 'Updated HR Staff',
            'email' => 'newhr@example.com',
            'role' => 'admin',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('hr_users', [
            'id' => $newUser->id,
            'name' => 'Updated HR Staff',
            'role' => 'admin',
        ]);

        // Delete other user
        $response = $this->delete(route('admin.users.destroy', $newUser->id));
        $response->assertRedirect();
        $this->assertDatabaseMissing('hr_users', ['id' => $newUser->id]);
    }

    public function test_admin_cannot_delete_self()
    {
        $this->actingAs($this->admin, 'hr');

        $response = $this->delete(route('admin.users.destroy', $this->admin->id));
        $response->assertRedirect();
        $this->assertDatabaseHas('hr_users', ['id' => $this->admin->id]);
    }

    public function test_admin_can_manage_categories()
    {
        $this->actingAs($this->admin, 'hr');

        // Store
        $response = $this->post(route('admin.categories.store'), [
            'name' => 'Driver Operational',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('job_categories', ['name' => 'Driver Operational', 'slug' => 'driver-operational']);

        $category = JobCategory::where('name', 'Driver Operational')->first();

        // Update
        $response = $this->put(route('admin.categories.update', $category->id), [
            'name' => 'Driver Professional',
            'slug' => 'custom-driver-slug',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('job_categories', [
            'id' => $category->id,
            'name' => 'Driver Professional',
            'slug' => 'custom-driver-slug',
        ]);

        // Delete
        $response = $this->delete(route('admin.categories.destroy', $category->id));
        $response->assertRedirect();
        $this->assertDatabaseMissing('job_categories', ['id' => $category->id]);
    }

    public function test_admin_can_manage_custom_profile_fields()
    {
        $this->actingAs($this->admin, 'hr');

        // Store
        $response = $this->post(route('admin.config.store'), [
            'field_label' => 'Tinggi Badan',
            'field_name' => 'tinggi_badan',
            'field_type' => 'text',
            'is_required' => false,
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('candidate_profile_fields', ['field_name' => 'tinggi_badan', 'sort_order' => 1]);

        $field = CandidateProfileField::where('field_name', 'tinggi_badan')->first();

        // Update
        $response = $this->put(route('admin.config.update', $field->id), [
            'field_label' => 'Tinggi Badan (cm)',
            'field_type' => 'select',
            'is_required' => true,
            'options' => ['> 160 cm', '< 160 cm'],
            'is_active' => true,
        ]);
        $response->assertRedirect();
        
        $updated = CandidateProfileField::find($field->id);
        $this->assertEquals('Tinggi Badan (cm)', $updated->field_label);
        $this->assertEquals('select', $updated->field_type);
        $this->assertTrue($updated->is_required);
        $this->assertEquals(['> 160 cm', '< 160 cm'], $updated->options);

        // Delete
        $response = $this->delete(route('admin.config.destroy', $field->id));
        $response->assertRedirect();
        $this->assertDatabaseMissing('candidate_profile_fields', ['id' => $field->id]);
    }

    public function test_admin_can_reorder_custom_profile_fields()
    {
        $this->actingAs($this->admin, 'hr');

        $field1 = CandidateProfileField::create([
            'field_name' => 'field_one',
            'field_label' => 'Field One',
            'field_type' => 'text',
            'is_required' => false,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $field2 = CandidateProfileField::create([
            'field_name' => 'field_two',
            'field_label' => 'Field Two',
            'field_type' => 'text',
            'is_required' => false,
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // Send reorder request swapping positions
        $response = $this->post(route('admin.config.reorder'), [
            'ids' => [$field2->id, $field1->id],
        ]);
        $response->assertRedirect();

        $this->assertEquals(1, CandidateProfileField::find($field2->id)->sort_order);
        $this->assertEquals(2, CandidateProfileField::find($field1->id)->sort_order);
    }
}
