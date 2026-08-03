<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiChatHistory extends Model
{
    use HasFactory;

    protected $table = 'ai_chat_histories';

    protected $fillable = [
        'user_id',
        'question',
        'answer',
    ];

    /**
     * AI chat history belongs to user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
