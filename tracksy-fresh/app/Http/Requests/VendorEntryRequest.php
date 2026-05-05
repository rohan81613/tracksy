<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VendorEntryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                  => ['required', 'string', 'max:255'],
            'notes'                 => ['nullable', 'string', 'max:2000'],
            'fields'                => ['nullable', 'array'],
            'fields.*.label'        => ['required', 'string', 'max:255'],
            'fields.*.value'        => ['nullable', 'string', 'max:1000'],
            'fields.*.sort_order'   => ['nullable', 'integer', 'min:0'],
        ];
    }
}
