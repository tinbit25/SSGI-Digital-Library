<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get notifications for authenticated user.
     * GET /api/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Fetch notifications assigned to user or broadcast
        $notifications = Notification::whereHas('recipients', function ($q) use ($user) {
            $q->where('users.id', $user->id);
        })->orWhereDoesntHave('recipients')
          ->latest()
          ->take(50)
          ->get();

        return response()->json([
            'success' => true,
            'data'    => $notifications,
        ]);
    }

    /**
     * Mark notification as read.
     * PUT /api/notifications/{id}/read
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $notification = Notification::findOrFail($id);

        // Attach or update read_at timestamp in pivot table
        $user->notifications()->syncWithoutDetaching([
            $notification->id => ['is_read' => true, 'read_at' => now()]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }
}
