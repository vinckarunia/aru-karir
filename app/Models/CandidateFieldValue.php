<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CandidateFieldValue extends Model
{
    protected $fillable = [
        'candidate_id',
        'profile_field_id',
        'value',
        'file_path',
    ];

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    public function profileField(): BelongsTo
    {
        return $this->belongsTo(CandidateProfileField::class, 'profile_field_id');
    }
}
