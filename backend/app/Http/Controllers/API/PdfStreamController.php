<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use App\Services\DocumentViewerService;
use Illuminate\Http\Request;

class PdfStreamController extends Controller
{
    protected DocumentViewerService $viewerService;

    public function __construct(DocumentViewerService $viewerService)
    {
        $this->viewerService = $viewerService;
    }

    /**
     * Show document viewer content for a given resource.
     * GET /api/resources/{resource}/viewer
     */
    public function show(Request $request, Resource $resource)
    {
        $user = $request->user();
        $page = (int) $request->query('page', 1);
        $rawStream = $request->query('format') === 'pdf' || $request->header('Accept') === 'application/pdf';

        return $this->viewerService->getViewerData($user, $resource, $page, $request->ip(), $rawStream);
    }
}
