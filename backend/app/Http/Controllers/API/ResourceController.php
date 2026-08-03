<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResourceRequest;
use App\Http\Requests\UpdateResourceRequest;
use App\Http\Resources\ResourceResource;
use App\Models\Resource;
use App\Models\AccessLog;
use App\Services\ResourceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResourceController extends Controller
{
    protected ResourceService $resourceService;

    public function __construct(ResourceService $resourceService)
    {
        $this->resourceService = $resourceService;
    }

    /**
     * List resources with search, filter, and pagination.
     * GET /api/resources
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'category_id',
            'resource_type',
            'language',
            'status',
            'sort_by',
            'sort_dir',
            'per_page',
        ]);

        // Only admins/librarians can filter by status; others see published only
        $user = $request->user();
        if (!$user || !$user->hasAnyRole(['Administrator', 'Librarian'])) {
            $filters['status'] = 'published';
        }

        $paginated = $this->resourceService->list($filters);

        return response()->json([
            'success' => true,
            'message' => 'Resources retrieved successfully.',
            'data'    => ResourceResource::collection($paginated->items()),
            'meta'    => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /**
     * Show a single resource.
     * GET /api/resources/{resource}
     */
    public function show(Request $request, Resource $resource): JsonResponse
    {
        // Non-admin/librarian users can only see published resources
        $user = $request->user();
        if ((!$user || !$user->hasAnyRole(['Administrator', 'Librarian'])) && $resource->status !== 'published') {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found.',
            ], 404);
        }

        $resource->load(['category', 'uploader'])->loadCount('chunks');

        // Log access if authenticated
        if ($user) {
            AccessLog::create([
                'user_id'     => $user->id,
                'resource_id' => $resource->id,
                'action'      => 'view',
                'ip_address'  => $request->ip(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Resource retrieved successfully.',
            'data'    => new ResourceResource($resource),
        ]);
    }

    /**
     * Upload a new resource.
     * POST /api/resources
     * Permission: Librarian, Administrator
     */
    public function store(StoreResourceRequest $request): JsonResponse
    {
        $resource = $this->resourceService->store(
            $request->validated(),
            $request->user()->id
        );

        $resource->load(['category', 'uploader']);

        return response()->json([
            'success' => true,
            'message' => 'Resource uploaded successfully.',
            'data'    => new ResourceResource($resource),
        ], 201);
    }

    /**
     * Update resource metadata or replace files.
     * PUT /api/resources/{resource}
     * Permission: Librarian (own upload), Administrator (any)
     */
    public function update(UpdateResourceRequest $request, Resource $resource): JsonResponse
    {
        $user = $request->user();

        // Librarians can only edit their own uploads
        if ($user->hasRole('Librarian') && $resource->uploaded_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this resource.',
            ], 403);
        }

        $resource = $this->resourceService->update($resource, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Resource updated successfully.',
            'data'    => new ResourceResource($resource),
        ]);
    }

    /**
     * Delete a resource and its files.
     * DELETE /api/resources/{resource}
     * Permission: Administrator only
     */
    /**
     * Archive a resource (set status to "archived").
     * DELETE /api/resources/{resource}
     * Permission: Librarian (own upload) or Administrator (any)
     */
    public function destroy(Request $request, Resource $resource): JsonResponse
    {
        $user = $request->user();

        // Administrator can permanently delete via forceDelete endpoint (handled separately)
        // Librarians can archive only their own resources, administrators can archive any.
        if ($user->hasRole('Librarian') && $resource->uploaded_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to archive this resource.',
            ], 403);
        }

        // Archive by setting status=archived (soft removal)
        $resource->update(['status' => 'archived']);

        return response()->json([
            'success' => true,
            'message' => 'Resource archived successfully.',
        ]);
    }

    /**
     * Permanently delete a resource.
     * DELETE /api/resources/{resource}/force
     * Permission: Administrator only
     */
    public function forceDelete(Request $request, Resource $resource): JsonResponse
    {
        if (!$request->user()?->hasRole('Administrator')) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can permanently delete resources.',
            ], 403);
        }

        $this->resourceService->destroy($resource);

        return response()->json([
            'success' => true,
            'message' => 'Resource permanently deleted.',
        ]);
    }
}
