<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * List all categories.
     * GET /api/categories
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('resources')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Categories retrieved successfully.',
            'data'    => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Create a category.
     * POST /api/categories
     * Permission: Librarian, Administrator
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data'    => new CategoryResource($category),
        ], 201);
    }

    /**
     * Update a category.
     * PUT /api/categories/{category}
     * Permission: Librarian, Administrator
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data'    => new CategoryResource($category->fresh()),
        ]);
    }

    /**
     * Delete a category.
     * DELETE /api/categories/{category}
     * Permission: Administrator only
     */
    public function destroy(Category $category): JsonResponse
    {
        if (!auth()->user()?->hasRole('Administrator')) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can delete categories.',
            ], 403);
        }

        if ($category->resources()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a category that has resources. Archive or reassign them first.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }
}
