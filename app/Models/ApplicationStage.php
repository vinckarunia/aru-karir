<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationStage extends Model
{
    use HasUuids;

    protected $fillable = [
        'application_id',
        'stage_name',
        'status',
        'rejection_reason',
        'notes',
        'actioned_by',
        'actioned_at',
    ];

    protected function casts(): array
    {
        return [
            'actioned_at' => 'datetime',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function actionedBy(): BelongsTo
    {
        return $this->belongsTo(HrUser::class, 'actioned_by');
    }
}
