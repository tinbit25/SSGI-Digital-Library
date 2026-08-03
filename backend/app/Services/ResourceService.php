<?php

namespace App\Services;

use App\Models\Resource;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResourceService
{
    /**
     * List resources with optional search/filter.
     */
    public function list(array $filters = []): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = Resource::with(['category', 'uploader'])
            ->withCount('chunks');

        // Filter by status visible to public
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        } else {
            $query->where('status', 'published');
        }

        // Full-text keyword search on title, description, keywords, author
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('keywords', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Filter by resource type
        if (!empty($filters['resource_type'])) {
            $query->where('resource_type', $filters['resource_type']);
        }

        // Filter by language
        if (!empty($filters['language'])) {
            $query->where('language', $filters['language']);
        }

        // Sorting
        $sortBy  = in_array($filters['sort_by'] ?? '', ['title', 'created_at', 'publication_year'])
            ? $filters['sort_by']
            : 'created_at';
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage);
    }

    /**
     * Create a new resource with file upload.
     */
    public function store(array $data, int $uploadedBy): Resource
    {
        // Store PDF securely in non-public disk
        $pdfPath = $this->storePdf($data['pdf_file']);

        // Store cover image publicly
        $coverImagePath = null;
        if (!empty($data['cover_image'])) {
            $coverImagePath = $this->storeCoverImage($data['cover_image']);
        }

        return Resource::create([
            'category_id'      => $data['category_id'],
            'uploaded_by'      => $uploadedBy,
            'title'            => $data['title'],
            'description'      => $data['description'] ?? null,
            'author'           => $data['author'] ?? null,
            'publisher'        => $data['publisher'] ?? null,
            'publication_year' => $data['publication_year'] ?? null,
            'isbn'             => $data['isbn'] ?? null,
            'language'         => $data['language'] ?? 'English',
            'resource_type'    => $data['resource_type'],
            'keywords'         => $data['keywords'] ?? null,
            'status'           => $data['status'] ?? 'published',
            'pdf_path'         => $pdfPath,
            'cover_image'      => $coverImagePath,
        ]);
    }

    /**
     * Update an existing resource (metadata and/or files).
     */
    public function update(Resource $resource, array $data): Resource
    {
        // Replace PDF if new one was uploaded
        if (!empty($data['pdf_file'])) {
            // Delete old PDF
            Storage::disk('local')->delete($resource->pdf_path);
            $data['pdf_path'] = $this->storePdf($data['pdf_file']);
        }

        // Replace cover image if new one was uploaded
        if (!empty($data['cover_image'])) {
            if ($resource->cover_image) {
                Storage::disk('public')->delete($resource->cover_image);
            }
            $data['cover_image'] = $this->storeCoverImage($data['cover_image']);
        }

        // Remove file objects — they have been processed above
        unset($data['pdf_file']);

        $resource->update($data);

        return $resource->fresh(['category', 'uploader']);
    }

    /**
     * Delete a resource and its files.
     */
    public function destroy(Resource $resource): void
    {
        // Remove PDF from private storage
        if ($resource->pdf_path) {
            Storage::disk('local')->delete($resource->pdf_path);
        }

        // Remove cover image from public storage
        if ($resource->cover_image) {
            Storage::disk('public')->delete($resource->cover_image);
        }

        $resource->delete();
    }

    /**
     * Store PDF in secure private disk — not publicly accessible.
     */
    private function storePdf(UploadedFile $file): string
    {
        $filename = Str::uuid() . '.pdf';
        return $file->storeAs('documents', $filename, 'local');
    }

    /**
     * Store cover image in public disk — accessible via URL.
     */
    private function storeCoverImage(UploadedFile $file): string
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        return $file->storeAs('covers', $filename, 'public');
    }
}
