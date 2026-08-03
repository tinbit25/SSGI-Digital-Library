<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'message',
        'target_role_id',
        'created_by',
    ];

    /**
     * Notification target role.
     */
    public function targetRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'target_role_id');
    }

    /**
     * User who created the notification.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User notification statuses.
     */
    public function notificationUsers(): HasMany
    {
        return $this->hasMany(NotificationUser::class);
    }

    /**
     * Users receiving this notification.
     */
    public function recipients(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'notification_users')
                    ->withPivot('is_read', 'read_at')
                    ->withTimestamps();
    }
}
