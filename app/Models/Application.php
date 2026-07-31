<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    use HasUuids;

    protected $fillable = [
        'candidate_id',
        'job_listing_id',
        'current_stage',
        'current_status',
        'applied_at',
        'viewed_at',
    ];

    protected function casts(): array
    {
        return [
            'applied_at' => 'datetime',
            'viewed_at' => 'datetime',
        ];
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    public function jobListing(): BelongsTo
    {
        return $this->belongsTo(JobListing::class);
    }

    public function stages(): HasMany
    {
        return $this->hasMany(ApplicationStage::class)->orderBy('created_at');
    }

    /**
     * Get the most recent stage record.
     */
    public function currentStageRecord(): HasOne
    {
        return $this->hasOne(ApplicationStage::class)->latestOfMany();
    }
}
