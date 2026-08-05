<?php

namespace App\Services;

use App\Models\Feedback;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class FeedbackService
{
    /**
     * Create a new feedback submission.
     */
    public function create(array $data): Feedback
    {
        return Feedback::create([
            'user_id'     => $data['user_id'] ?? null,
            'subject'     => $data['subject'] ?? null,
            'message'     => $data['message'],
            'type'        => $data['type'] ?? 'general',
            'resource_id' => $data['resource_id'] ?? null,
            'status'      => $data['status'] ?? 'Pending',
        ]);
    }

    /**
     * Update status of feedback submission.
     */
    public function updateStatus(Feedback $feedback, string $status): Feedback
    {
        $feedback->update(['status' => $status]);
        return $feedback->fresh('user');
    }

    /**
     * List all feedback with pagination.
     */
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Feedback::with('user');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->latest()->paginate($perPage);
    }
}
