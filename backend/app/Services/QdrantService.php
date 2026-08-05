<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class QdrantService
{
    protected string $baseUrl;
    protected string $collection;

    public function __construct()
    {
        $host = env('QDRANT_HOST', 'localhost');
        $port = env('QDRANT_PORT', '6333');
        $this->baseUrl = rtrim("http://{$host}:{$port}", '/');
        $this->collection = env('QDRANT_COLLECTION', 'resources');
    }

    /**
     * Ensure the target collection exists in Qdrant.
     */
    public function ensureCollectionExists(int $vectorSize = 384, string $distance = 'Cosine'): bool
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/collections/{$this->collection}");
            if ($response->successful()) {
                return true;
            }

            // Create collection if missing
            $createResponse = Http::timeout(5)->put("{$this->baseUrl}/collections/{$this->collection}", [
                'vectors' => [
                    'size' => $vectorSize,
                    'distance' => $distance,
                ]
            ]);

            return $createResponse->successful();
        } catch (Exception $e) {
            Log::error('Qdrant collection initialization failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Upsert a point (vector + payload) into Qdrant.
     */
    public function upsert(string|int $id, array $vector, array $payload = []): bool
    {
        try {
            $this->ensureCollectionExists(count($vector));

            $pointId = is_numeric($id) ? (int)$id : $id;

            $response = Http::timeout(10)->put("{$this->baseUrl}/collections/{$this->collection}/points", [
                'points' => [
                    [
                        'id' => $pointId,
                        'vector' => $vector,
                        'payload' => $payload,
                    ]
                ]
            ]);

            if (!$response->successful()) {
                Log::error('Qdrant point upsert failed', ['status' => $response->status(), 'body' => $response->body()]);
                return false;
            }

            return true;
        } catch (Exception $e) {
            Log::error('Qdrant upsert exception', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Search nearest neighbors in Qdrant.
     */
    public function search(array $vector, int $limit = 5): array
    {
        try {
            $response = Http::timeout(10)->post("{$this->baseUrl}/collections/{$this->collection}/points/search", [
                'vector' => $vector,
                'limit' => $limit,
                'with_payload' => true,
            ]);

            if (!$response->successful()) {
                Log::error('Qdrant search failed', ['status' => $response->status(), 'body' => $response->body()]);
                return [];
            }

            $result = $response->json('result');
            return is_array($result) ? $result : [];
        } catch (Exception $e) {
            Log::error('Qdrant search exception', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Delete a point from Qdrant by ID.
     */
    public function delete(string|int $id): bool
    {
        try {
            $pointId = is_numeric($id) ? (int)$id : $id;

            $response = Http::timeout(5)->post("{$this->baseUrl}/collections/{$this->collection}/points/delete", [
                'points' => [$pointId]
            ]);

            return $response->successful();
        } catch (Exception $e) {
            Log::error('Qdrant delete exception', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
