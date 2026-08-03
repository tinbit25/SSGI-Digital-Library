<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class EmbeddingService
{
    /**
     * Generate a vector embedding for a given text using the Python embed script.
     *
     * @param string $text
     * @return array Numeric vector (float values) or empty array on failure.
     */
    public function generateEmbedding(string $text): array
    {
        // Escape the argument for the shell
        $escaped = escapeshellarg($text);
        $command = "python " . base_path('scripts/embed.py') . " $escaped";
        exec($command, $output, $returnVar);
        if ($returnVar !== 0) {
            Log::error('Embedding script failed', ['command' => $command, 'exit_code' => $returnVar]);
            return [];
        }
        $json = implode("", $output);
        $embedding = json_decode($json, true);
        if (!is_array($embedding)) {
            Log::error('Invalid embedding JSON', ['raw' => $json]);
            return [];
        }
        return $embedding;
    }
}
?>
