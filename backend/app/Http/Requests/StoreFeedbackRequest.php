<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeedbackRequest extends FormRequest
{
    public function authorize()
    {
        // Any authenticated user can submit feedback
        return $this->user() !== null;
    }

    public function rules()
    {
        return [
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ];
    }
}
?>
