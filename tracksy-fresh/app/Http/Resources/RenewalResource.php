<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RenewalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => (string) $this->id,
            'name'                => $this->name,
            'vendor'              => $this->vendor,
            'amount'              => (float) $this->amount,
            'amount_inr'          => $this->amount_inr !== null ? (float) $this->amount_inr : null,
            'billing_cycle'       => $this->billing_cycle,
            'purchase_date'       => $this->purchase_date?->format('Y-m-d'),
            'renewal_date'        => $this->renewal_date->format('Y-m-d'),
            'reminder_days'       => $this->reminder_days,
            'category'            => $this->category,
            'currency'            => $this->currency ?? 'USD',
            'notes'               => $this->notes,
            // Computed
            'status'                => $this->status,
            'days_until_renewal'    => $this->days_until_renewal,
            'monthly_amount'        => round($this->monthly_amount, 2),
            'yearly_amount'         => round($this->yearly_amount, 2),
            'upcoming_renewal_date' => $this->upcoming_renewal_date->format('Y-m-d'),
            'next_renewal_date'     => $this->upcoming_renewal_date->format('Y-m-d'), // kept for backward compat
            'created_at'          => $this->created_at->toISOString(),
            'updated_at'          => $this->updated_at->toISOString(),
        ];
    }
}
