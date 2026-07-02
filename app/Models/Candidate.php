<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Candidate extends Authenticatable
{
    use HasUuids, Notifiable;

    protected $guard = 'candidate';

    protected $fillable = [
        'email',
        'password',
        'name',
        'phone',
        'birth_date',
        'gender',
        'ktp_number',
        'mother_name',
        'address',
        'education_level',
        'cv_path',
        'profile_photo_path',
        'profile_completed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'profile_completed_at' => 'datetime',
            'birth_date' => 'date',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if the candidate has completed their profile.
     */
    public function getIsProfileCompleteAttribute(): bool
    {
        return !is_null($this->profile_completed_at);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function fieldValues(): HasMany
    {
        return $this->hasMany(CandidateFieldValue::class);
    }
}
