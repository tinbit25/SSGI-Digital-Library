<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * POST /api/ai/chat
     *
     * Expected JSON: {"question": "..."}
     */
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|min:1',
        ]);

        $question = $validated['question'];
        $user = Auth::user();
        $userId = $user ? $user->id : null;

        // Log AI usage (can be a separate model/table if needed)
        Log::info('AI chat request', ['user_id' => $userId, 'question' => $question]);

        $answer = $this->aiService->chat($userId, $question);

        return response()->json([
            'success' => true,
            'question' => $question,
            'answer'   => $answer,
        ]);
    }
}
?>
