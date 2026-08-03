<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResourceChunk extends Model
{
    use HasFactory;

    protected $fillable = [
        'resource_id',
        'chunk_index',
        'page_number',
        'chunk_text',
        'vector_id',
    ];

    /**
     * Chunk belongs to resource.
     */
    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }
}
