<?php

namespace App\Services;

use App\Models\AiChatHistory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class AIService
{
    protected EmbeddingService $embeddingService;
    protected SemanticSearchService $semanticSearchService;

    public function __construct(EmbeddingService $embeddingService, SemanticSearchService $semanticSearchService)
    {
        $this->embeddingService = $embeddingService;
        $this->semanticSearchService = $semanticSearchService;
    }

    /**
     * Process a user question using Retrieval‑Augmented Generation.
     *
     * @param int|null $userId   ID of the user (null for guests).
     * @param string   $question The user question.
     * @return string  Generated answer.
     */
    public function chat(?int $userId, string $question): string
    {
        // 1. Generate embedding for the question.
        $embedding = $this->embeddingService->generateEmbedding($question);
        if (empty($embedding)) {
            Log::warning('Failed to generate embedding for question', ['question' => $question]);
            return 'Unable to process the request at this time.';
        }

        // 2. Retrieve relevant chunks from Qdrant via SemanticSearchService.
        $chunks = $this->semanticSearchService->search($question);
        if (empty($chunks)) {
            Log::info('No relevant document context found for question', ['question' => $question]);
            return 'I could not find any relevant documents to answer your question.';
        }

        // 3. Build context string (concatenate matched_text).
        $context = collect($chunks)->pluck('matched_text')->join("\n\n");

        // 4. Prepare prompt for LLM.
        $prompt = "Context:\n{$context}\n\nQuestion: {$question}\n\nAnswer:";

        // 5. Call LLM (placeholder – expects env variable LLM_ENDPOINT).
        $endpoint = env('LLM_ENDPOINT');
        if (!$endpoint) {
            Log::error('LLM_ENDPOINT not configured');
            return 'AI service is not configured properly.';
        }

        try {
            $response = Http::timeout(30)->post($endpoint, ['prompt' => $prompt]);
            if ($response->successful()) {
                $answer = $response->json('answer') ?? $response->body();
            } else {
                Log::error('LLM request failed', ['status' => $response->status(), 'body' => $response->body()]);
                $answer = 'The language model failed to generate a response.';
            }
        } catch (\Exception $e) {
            Log::error('Exception calling LLM', ['exception' => $e]);
            $answer = 'An error occurred while generating the answer.';
        }

        // 6. Persist chat history.
        AiChatHistory::create([
            'user_id'  => $userId,
            'question' => $question,
            'answer'   => $answer,
        ]);

        return $answer;
    }
}
?>
