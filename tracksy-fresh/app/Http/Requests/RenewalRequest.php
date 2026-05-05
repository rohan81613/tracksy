<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RenewalRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:255'],
            'vendor'        => ['required', 'string', 'max:255'],
            'amount'        => ['required', 'numeric', 'min:0'],
            'amount_inr'    => ['nullable', 'numeric', 'min:0'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'purchase_date' => ['nullable', 'date'],
            'renewal_date'  => ['required', 'date'],
            'reminder_days' => ['required', 'integer', 'min:0', 'max:365'],
            'category'      => ['nullable', 'string', 'max:100'],
            'currency'      => ['nullable', 'string', 'in:USD,INR'],
            'notes'         => ['nullable', 'string', 'max:2000'],
        ];
    }
}
