<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends SpatieRole
{
    protected $fillable = [
        'name',
        'description',
        'guard_name',
    ];

    /**
     * Get direct users associated with this role via role_id foreign key.
     */
    public function directUsers(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
