<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class LocalizationTest extends TestCase
{
    public function test_validation_messages_use_indonesian_labels(): void
    {
        app()->setLocale('id');

        $validator = Validator::make([], [
            'school_graduation_year' => ['required'],
            'emergency_contacts' => ['required', 'array', 'min:1'],
        ]);

        $messages = $validator->errors();

        $this->assertSame('Kolom tahun kelulusan wajib diisi.', $messages->first('school_graduation_year'));
        $this->assertSame('Kolom kontak darurat wajib diisi.', $messages->first('emergency_contacts'));
        $this->assertStringNotContainsString('validation.', $messages->toJson());
    }

    public function test_custom_attributes_are_humanized_in_indonesian(): void
    {
        app()->setLocale('id');

        $validator = Validator::make(
            [],
            ['custom_10' => ['required']],
            [],
            ['custom_10' => 'Sertifikasi Keahlian'],
        );

        $this->assertSame('Kolom Sertifikasi Keahlian wajib diisi.', $validator->errors()->first('custom_10'));
    }
}
