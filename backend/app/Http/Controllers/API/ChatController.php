<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AIService;
use App\Services\SearchService;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    protected AIService $aiService;
    protected SearchService $searchService;

    public function __construct(AIService $aiService, SearchService $searchService)
    {
        $this->aiService = $aiService;
        $this->searchService = $searchService;
    }

    /**
     * POST /api/ai/chat
     */
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|min:1',
        ]);

        $question = $validated['question'];
        $user = Auth::user();
        $userId = $user ? $user->id : null;

        Log::info('AI chat request', ['user_id' => $userId, 'question' => $question]);

        $answer = $this->aiService->chat($userId, $question);

        return response()->json([
            'success'  => true,
            'question' => $question,
            'answer'   => $answer,
        ]);
    }

    /**
     * POST /api/ai/recommend
     */
    public function recommend(Request $request)
    {
        $validated = $request->validate([
            'query' => 'nullable|string',
        ]);

        $query = $validated['query'] ?? '';
        $results = $this->searchService->search($query);

        return response()->json([
            'success'         => true,
            'recommendations' => $results->items(),
            'data'            => $results->items(),
        ]);
    }

    /**
     * POST /api/ai/summary
     */
    public function summary(Request $request)
    {
        $validated = $request->validate([
            'query'       => 'nullable|string',
            'resource_id' => 'nullable|integer|exists:resources,id',
        ]);

        $summaryText = 'This resource provides key findings, structural analyses, and reference materials for digital library research.';

        if (!empty($validated['resource_id'])) {
            $resource = Resource::find($validated['resource_id']);
            if ($resource && $resource->description) {
                $summaryText = $resource->description;
            }
        }

        return response()->json([
            'success' => true,
            'summary' => $summaryText,
            'data'    => $summaryText,
        ]);
    }
}
