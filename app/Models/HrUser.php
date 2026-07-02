<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class HrUser extends Authenticatable
{
    use HasUuids, Notifiable;

    protected $guard = 'hr';

    protected $appends = [
        'is_admin',
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if the user has admin role.
     */
    public function getIsAdminAttribute(): bool
    {
        return $this->role === 'admin';
    }

    public function jobListings(): HasMany
    {
        return $this->hasMany(JobListing::class, 'created_by');
    }

    public function actionedStages(): HasMany
    {
        return $this->hasMany(ApplicationStage::class, 'actioned_by');
    }
}
