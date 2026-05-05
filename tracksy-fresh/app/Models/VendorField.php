<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorField extends Model
{
    use HasFactory;

    protected $fillable = ['vendor_entry_id', 'label', 'value', 'sort_order'];

    public function vendorEntry(): BelongsTo
    {
        return $this->belongsTo(VendorEntry::class);
    }
}
