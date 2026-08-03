<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('upload resources') || $this->user()?->hasAnyRole(['Administrator', 'Librarian']);
    }

    public function rules(): array
    {
        return [
            'title'            => ['required', 'string', 'max:500'],
            'description'      => ['nullable', 'string', 'max:5000'],
            'category_id'      => ['required', 'integer', 'exists:categories,id'],
            'author'           => ['nullable', 'string', 'max:255'],
            'publisher'        => ['nullable', 'string', 'max:255'],
            'publication_year' => ['nullable', 'integer', 'min:1800', 'max:' . (date('Y') + 1)],
            'isbn'             => ['nullable', 'string', 'max:20'],
            'language'         => ['nullable', 'string', 'max:50'],
            'resource_type'    => ['required', 'string', 'in:book,paper,manual,report,training'],
            'keywords'         => ['nullable', 'string', 'max:1000'],
            'status'           => ['nullable', 'string', 'in:draft,published,archived'],
            'pdf_file'         => ['required', 'file', 'mimes:pdf', 'max:51200'],   // max 50 MB
            'cover_image'      => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'], // max 2 MB
        ];
    }

    public function messages(): array
    {
        return [
            'pdf_file.required' => 'A PDF document is required.',
            'pdf_file.mimes'    => 'Only PDF files are accepted.',
            'pdf_file.max'      => 'The PDF file may not exceed 50 MB.',
            'cover_image.image' => 'The cover image must be a valid image file.',
            'cover_image.max'   => 'The cover image may not exceed 2 MB.',
        ];
    }
}
