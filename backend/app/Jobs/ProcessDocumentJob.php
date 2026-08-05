<?php

namespace App\Jobs;

use App\Models\Resource;
use App\Models\ResourceChunk;
use App\Services\EmbeddingService;
use App\Services\QdrantService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class ProcessDocumentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Resource $resource;

    /**
     * Create a new job instance.
     */
    public function __construct(Resource $resource)
    {
        $this->resource = $resource;
    }

    /**
     * Execute the job.
     */
    public function handle(EmbeddingService $embeddingService, QdrantService $qdrantService): void
    {
        $this->resource->update(['processing_status' => 'processing']);

        try {
            $pdfPath = $this->resource->pdf_path;
            if (!$pdfPath || !Storage::disk('local')->exists($pdfPath)) {
                Log::error('PDF file missing for processing', ['resource_id' => $this->resource->id]);
                $this->resource->update(['processing_status' => 'failed']);
                return;
            }

            $fullPath = Storage::disk('local')->path($pdfPath);
            $text = $this->extractTextFromPdf($fullPath);

            if (empty(trim($text))) {
                // Fallback text from metadata if PDF text stream is empty
                $text = "Title: {$this->resource->title}\nDescription: {$this->resource->description}\nAuthor: {$this->resource->author}";
            }

            // Split text into chunks (~500 characters)
            $chunks = str_split($text, 500);

            // Delete existing chunks if re-processing
            $this->resource->chunks()->delete();

            foreach ($chunks as $index => $chunkText) {
                $chunkText = trim($chunkText);
                if (empty($chunkText)) {
                    continue;
                }

                $vectorId = (string) Str::uuid();

                // Generate vector embedding
                $embedding = $embeddingService->generateEmbedding($chunkText);

                if (!empty($embedding)) {
                    // Upsert vector into Qdrant
                    $qdrantService->upsert($vectorId, $embedding, [
                        'resource_id'  => $this->resource->id,
                        'chunk_index'  => $index,
                        'matched_text' => $chunkText,
                    ]);
                }

                // Store metadata in resource_chunks table
                ResourceChunk::create([
                    'resource_id'  => $this->resource->id,
                    'chunk_index'  => $index,
                    'page_number'  => floor($index / 2) + 1,
                    'chunk_text'   => $chunkText,
                    'vector_id'    => $vectorId,
                ]);
            }

            $this->resource->update(['processing_status' => 'completed']);
            Log::info('Document processing completed successfully', ['resource_id' => $this->resource->id]);

        } catch (Exception $e) {
            Log::error('Document processing failed exception', [
                'resource_id' => $this->resource->id,
                'error'       => $e->getMessage()
            ]);
            $this->resource->update(['processing_status' => 'failed']);
        }
    }

    /**
     * Extract text content from PDF file.
     */
    private function extractTextFromPdf(string $filePath): string
    {
        if (class_exists(\Smalot\PdfParser\Parser::class)) {
            try {
                $parser = new \Smalot\PdfParser\Parser();
                $pdf = $parser->parseFile($filePath);
                return $pdf->getText();
            } catch (Exception $e) {
                Log::warning('Smalot pdfparser failed, falling back to raw extract', ['error' => $e->getMessage()]);
            }
        }

        // Basic fallback text extraction from PDF stream
        $content = @file_get_contents($filePath);
        if ($content === false) {
            return '';
        }

        // Extract printable text sections between BT ... ET tags
        preg_match_all('/BT[\s\S]*?ET/s', $content, $matches);
        $rawText = implode(' ', $matches[0] ?? []);
        $cleanText = preg_replace('/[^\w\s\.,!\?-]/u', '', strip_tags($rawText));

        return trim($cleanText);
    }
}
