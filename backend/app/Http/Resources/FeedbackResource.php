<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'user_id'    => $this->user_id,
            'user'       => $this->whenLoaded('user', function () {
                return [
                    'id'        => $this->user->id,
                    'full_name' => "{$this->user->first_name} {$this->user->last_name}",
                    'email'     => $this->user->email,
                ];
            }),
            'subject'    => $this->subject,
            'message'    => $this->message,
            'type'       => $this->type ?? 'General',
            'status'     => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
