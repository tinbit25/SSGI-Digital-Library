<?php

namespace App\Services;

use App\Models\ResourceChunk;
use Illuminate\Support\Facades\Log;

class SemanticSearchService
{
    protected EmbeddingService $embeddingService;
    protected QdrantService $qdrantService;

    public function __construct(EmbeddingService $embeddingService, QdrantService $qdrantService)
    {
        $this->embeddingService = $embeddingService;
        $this->qdrantService = $qdrantService;
    }

    /**
     * Perform a semantic search.
     *
     * @param string $query   User query string.
     * @param int    $topK    Number of nearest chunks to retrieve.
     * @return array           Array of results with resource info and similarity.
     */
    public function search(string $query, int $topK = 5): array
    {
        // 1. Generate embedding for the query
        $embedding = $this->embeddingService->generateEmbedding($query);
        if (empty($embedding)) {
            Log::warning('Embedding generation failed for query', ['query' => $query]);
            return [];
        }

        // 2. Query Qdrant for similar vectors
        $hits = $this->qdrantService->search($embedding, $topK);
        if (empty($hits)) {
            return [];
        }

        $results = [];
        foreach ($hits as $hit) {
            $vectorId = $hit['id'];
            $score = $hit['score'];
            $payload = $hit['payload'];

            // payload should contain resource_id, chunk_index, page_number, chunk_text
            $resourceChunk = ResourceChunk::where('vector_id', $vectorId)->first();
            if (!$resourceChunk) {
                continue;
            }
            $resource = $resourceChunk->resource;
            $results[] = [
                'resource_title' => $resource->title ?? null,
                'author' => $resource->author ?? null,
                'page_number' => $resourceChunk->page_number,
                'matched_text' => $resourceChunk->chunk_text,
                'similarity_score' => $score,
            ];
        }

        return $results;
    }
}
?>
