<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackRequest;
use App\Http\Resources\FeedbackResource;
use App\Models\Feedback;
use App\Services\FeedbackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    protected FeedbackService $feedbackService;

    public function __construct(FeedbackService $feedbackService)
    {
        $this->feedbackService = $feedbackService;
    }

    /**
     * List all feedback (admin/librarian only).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->hasAnyRole(['Administrator', 'Librarian'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $feedback = Feedback::with('user')->latest()->paginate(20);
        return response()->json([
            'success' => true,
            'data' => FeedbackResource::collection($feedback),
            'meta' => [
                'current_page' => $feedback->currentPage(),
                'last_page' => $feedback->lastPage(),
                'per_page' => $feedback->perPage(),
                'total' => $feedback->total(),
            ],
        ]);
    }

    /**
     * Store new feedback (any authenticated user).
     */
    public function store(StoreFeedbackRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $data['user_id'] = $user->id;
        $data['status'] = 'Pending';
        $feedback = $this->feedbackService->create($data);
        return response()->json([
            'success' => true,
            'data' => new FeedbackResource($feedback),
        ], 201);
    }

    /**
     * Update feedback status (admin/librarian only).
     */
    public function update(Request $request, Feedback $feedback): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->hasAnyRole(['Administrator', 'Librarian'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $validated = $request->validate([
            'status' => 'required|in:Pending,Reviewed,Resolved',
        ]);
        $feedback = $this->feedbackService->updateStatus($feedback, $validated['status']);
        return response()->json([
            'success' => true,
            'data' => new FeedbackResource($feedback),
        ]);
    }
}
?>
