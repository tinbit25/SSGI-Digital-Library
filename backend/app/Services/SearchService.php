<?php

namespace App\Services;

use App\Models\Resource;
use Illuminate\Support\Facades\Auth;

class SearchService
{
    /**
     * Perform a search over resources.
     *
     * @param string $query   Free‑text search term.
     * @param array  $filters Optional associative array of filters: category, author, type, keywords.
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function search(string $query = '', array $filters = [])
    {
        $builder = Resource::query()->with(['category', 'uploader']);

        // Full‑text like search on title, description, keywords, author
        if (!empty($query)) {
            $builder->where(function ($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhere('author', 'LIKE', "%{$query}%")
                  ->orWhere('keywords', 'LIKE', "%{$query}%");
            });
        }

        // Apply optional filters
        if (!empty($filters['category'])) {
            $builder->whereHas('category', function ($q) use ($filters) {
                $q->where('name', $filters['category']);
            });
        }
        if (!empty($filters['author'])) {
            $builder->where('author', $filters['author']);
        }
        if (!empty($filters['type'])) {
            $builder->where('resource_type', $filters['type']);
        }
        if (!empty($filters['keywords'])) {
            $builder->where('keywords', 'LIKE', "%{$filters['keywords']}%");
        }

        // Guest users can only see public resources (status = 'public')
        $user = Auth::user();
        if (!$user) {
            $builder->where('status', 'public');
        }

        return $builder->orderByDesc('created_at')->paginate(15);
    }
}
