<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResourceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'title'            => $this->title,
            'description'      => $this->description,
            'author'           => $this->author,
            'publisher'        => $this->publisher,
            'publication_year' => $this->publication_year,
            'isbn'             => $this->isbn,
            'language'         => $this->language,
            'resource_type'    => $this->resource_type,
            'keywords'         => $this->keywords,
            'status'           => $this->status,
            'cover_image_url'  => $this->cover_image
                ? asset('storage/' . $this->cover_image)
                : null,
            // pdf_path is intentionally excluded — stream via dedicated endpoint only
            'category'         => new CategoryResource($this->whenLoaded('category')),
            'uploaded_by'      => $this->whenLoaded('uploader', fn() => [
                'id'        => $this->uploader->id,
                'full_name' => $this->uploader->first_name . ' ' . $this->uploader->last_name,
            ]),
            'chunks_count'     => $this->whenCounted('chunks'),
            'created_at'       => $this->created_at?->toISOString(),
            'updated_at'       => $this->updated_at?->toISOString(),
        ];
    }
}
