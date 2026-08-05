<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resource extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'uploaded_by',
        'title',
        'description',
        'author',
        'publisher',
        'publication_year',
        'isbn',
        'language',
        'resource_type',
        'keywords',
        'cover_image',
        'pdf_path',
        'status',
        'processing_status',
    ];

    /**
     * Resource belongs to category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Resource belongs to uploader (User).
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Resource has many chunks for AI/RAG.
     */
    public function chunks(): HasMany
    {
        return $this->hasMany(ResourceChunk::class);
    }

    /**
     * Resource has many access logs.
     */
    public function accessLogs(): HasMany
    {
        return $this->hasMany(AccessLog::class);
    }
}
