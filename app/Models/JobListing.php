<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class JobListing extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'requirements',
        'location',
        'contract_type',
        'salary_range_min',
        'salary_range_max',
        'salary_visible',
        'hris_project_id',
        'status',
        'quota',
        'deadline_at',
        'created_by',
        'required_fields',
    ];

    protected function casts(): array
    {
        return [
            'salary_visible' => 'boolean',
            'deadline_at' => 'datetime',
            'salary_range_min' => 'integer',
            'salary_range_max' => 'integer',
            'quota' => 'integer',
            'required_fields' => 'array',
        ];
    }

    /**
     * Scope: only published listings.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope: published + not past deadline + not filled quota.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->published()
            ->where(function (Builder $q) {
                $q->whereNull('deadline_at')
                    ->orWhere('deadline_at', '>', now());
            });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(HrUser::class, 'created_by');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(JobCategory::class, 'job_listing_category');
    }
}
