<?php

namespace App\Services;

use App\Models\Resource;
use App\Models\User;
use App\Models\AccessLog;
use Illuminate\Support\Facades\Storage;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Http\JsonResponse;

class DocumentViewerService
{
    /**
     * Return page viewer response (JSON for frontend DocumentViewer or inline binary stream).
     *
     * @param User $user
     * @param Resource $resource
     * @param int $page
     * @param string|null $ipAddress
     * @param bool $rawStream
     * @return JsonResponse|StreamedResponse
     * @throws AuthorizationException|NotFoundHttpException
     */
    public function getViewerData(User $user, Resource $resource, int $page = 1, ?string $ipAddress = null, bool $rawStream = false)
    {
        // 1. Authorization check via ResourcePolicy
        if (!$user->can('view', $resource)) {
            throw new AuthorizationException('You are not authorized to view this document.');
        }

        // 2. Check if file exists in private local storage
        $pdfPath = $resource->pdf_path;
        if (!$pdfPath || !Storage::disk('local')->exists($pdfPath)) {
            throw new NotFoundHttpException('Document file not found on server.');
        }

        // 3. Log access
        AccessLog::create([
            'user_id'     => $user->id,
            'resource_id' => $resource->id,
            'action'      => 'view_pdf',
            'ip_address'  => $ipAddress,
        ]);

        // 4. Return raw inline stream if requested
        if ($rawStream) {
            $fullPath = Storage::disk('local')->path($pdfPath);
            $fileSize = filesize($fullPath);

            return response()->stream(
                function () use ($fullPath) {
                    $stream = fopen($fullPath, 'rb');
                    fpassthru($stream);
                    if (is_resource($stream)) {
                        fclose($stream);
                    }
                },
                200,
                [
                    'Content-Type'        => 'application/pdf',
                    'Content-Length'      => $fileSize,
                    'Content-Disposition' => 'inline; filename="document.pdf"',
                    'Cache-Control'       => 'private, max-age=3600, no-transform',
                    'X-Content-Type-Options' => 'nosniff',
                ]
            );
        }

        // 5. Default JSON page-by-page rendering for protected DocumentViewer component
        $chunks = $resource->chunks()->where('page_number', $page)->get();
        $maxPage = (int) $resource->chunks()->max('page_number');
        $totalPages = max($maxPage, 1);

        $textBlocks = $chunks->pluck('chunk_text')->filter()->values()->toArray();

        if (empty($textBlocks)) {
            $fullPath = Storage::disk('local')->path($pdfPath);
            $extracted = $this->extractPageText($fullPath, $page);
            if (!empty($extracted)) {
                $textBlocks = explode("\n", $extracted);
            }
        }

        if (empty($textBlocks)) {
            $textBlocks = [
                "SECTION {$page}.0: INSTITUTIONAL GEOSPATIAL & SPACE RESEARCH DATA",
                "Resource Title: {$resource->title}",
                "Author: " . ($resource->author ?: 'Ethiopian Space Science and Geospatial Institute (SSGI)'),
                "Description: " . ($resource->description ?: 'Verified remote sensing telemetry, ionospheric observation logs, and spatial analysis methodology.'),
                "All document access is monitored under SSGI Digital Rights Management (DRM) Policy. Raw downloads, printing, and file exports are strictly prohibited."
            ];
        }

        return response()->json([
            'success' => true,
            'total_pages' => $totalPages,
            'page_data' => [
                'page_number' => $page,
                'title'       => $resource->title,
                'text_blocks' => array_values(array_filter($textBlocks)),
            ],
        ]);
    }

    /**
     * Helper to extract page text from PDF file.
     */
    private function extractPageText(string $filePath, int $page): string
    {
        if (class_exists(\Smalot\PdfParser\Parser::class)) {
            try {
                $parser = new \Smalot\PdfParser\Parser();
                $pdf = $parser->parseFile($filePath);
                $pages = $pdf->getPages();
                if (isset($pages[$page - 1])) {
                    return trim($pages[$page - 1]->getText());
                }
            } catch (\Exception $e) {
                // Ignore parsing errors
            }
        }
        return '';
    }
}
