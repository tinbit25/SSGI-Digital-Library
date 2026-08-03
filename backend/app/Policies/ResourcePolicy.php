<?php

namespace App\Policies;

use App\Models\Resource;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ResourcePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the resource PDF.
     */
    public function view(User $user, Resource $resource): bool
    {
        // Administrators, Librarians, and Staff can view any permitted document
        if ($user->hasAnyRole(['Administrator', 'Librarian', 'Staff'])) {
            return true;
        }
        // Guests/Trainees can only view public resources (e.g., status = 'published')
        return $resource->status === 'published';
    }
}
