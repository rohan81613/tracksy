<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => (string) $this->id,
            'renewal_id' => (string) $this->renewal_id,
            'name'       => $this->name,
            'notes'      => $this->notes,
            'fields'     => $this->fields->map(fn($f) => [
                'id'         => (string) $f->id,
                'label'      => $f->label,
                'value'      => $f->value,
                'sort_order' => $f->sort_order,
            ])->values(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
