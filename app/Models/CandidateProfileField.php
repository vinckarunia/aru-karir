<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CandidateProfileField extends Model
{
    protected $fillable = [
        'field_name',
        'field_label',
        'field_type',
        'is_required',
        'sort_order',
        'options',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'options' => 'array',
            'sort_order' => 'integer',
        ];
    }
}
