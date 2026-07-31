<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class BusinessOption extends Model
{
    public const GROUPS = [
        'contract_type' => 'Tipe Kontrak',
        'gender' => 'Jenis Kelamin',
        'religion' => 'Agama',
        'blood_type' => 'Golongan Darah',
        'uniform_size' => 'Ukuran Seragam',
        'marital_status' => 'Status Pernikahan',
        'education_level' => 'Tingkat Pendidikan',
    ];

    protected $fillable = ['group', 'code', 'label', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return ['sort_order' => 'integer', 'is_active' => 'boolean'];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public static function grouped(bool $onlyActive = true): array
    {
        $query = static::orderBy('group')->orderBy('sort_order')->orderBy('label');
        if ($onlyActive) {
            $query->active();
        }

        return $query->get()->groupBy('group')->map->values()->all();
    }

    public static function codes(string $group): array
    {
        return static::active()->where('group', $group)->pluck('code')->all();
    }
}
