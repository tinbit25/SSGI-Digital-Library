<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'role_id',
        'first_name',
        'last_name',
        'email',
        'password',
        'status',
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
     * Get user's role.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Resources uploaded by user.
     */
    public function uploadedResources(): HasMany
    {
        return $this->hasMany(Resource::class, 'uploaded_by');
    }

    /**
     * Feedback submitted by user.
     */
    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    /**
     * Access logs for user.
     */
    public function accessLogs(): HasMany
    {
        return $this->hasMany(AccessLog::class);
    }

    /**
     * AI chat history for user.
     */
    public function aiChatHistories(): HasMany
    {
        return $this->hasMany(AiChatHistory::class);
    }

    /**
     * Notifications sent to user via pivot table.
     */
    public function notifications(): BelongsToMany
    {
        return $this->belongsToMany(Notification::class, 'notification_users')
                    ->withPivot('is_read', 'read_at')
                    ->withTimestamps();
    }
}
