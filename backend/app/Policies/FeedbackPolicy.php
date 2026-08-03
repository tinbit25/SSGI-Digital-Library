<?php

namespace App\Policies;

use App\Models\Feedback;
use App\Models\User;

class FeedbackPolicy
{
    public function create(User $user)
    {
        // All authenticated users can create feedback
        return $user->hasAnyRole(['Staff', 'Guest', 'Librarian', 'Administrator']);
    }

    public function viewAny(User $user)
    {
        // Only Librarian and Administrator can view all feedback
        return $user->hasAnyRole(['Librarian', 'Administrator']);
    }

    public function view(User $user, Feedback $feedback)
    {
        // Same as viewAny for simplicity
        return $this->viewAny($user);
    }

    public function update(User $user, Feedback $feedback)
    {
        // Only Librarian and Administrator can update status
        return $user->hasAnyRole(['Librarian', 'Administrator']);
    }
}
