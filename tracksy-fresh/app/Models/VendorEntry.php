<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorEntry extends Model
{
    use HasFactory;

    protected $fillable = ['renewal_id', 'name', 'notes'];

    public function renewal(): BelongsTo
    {
        return $this->belongsTo(Renewal::class);
    }

    public function fields(): HasMany
    {
        return $this->hasMany(VendorField::class)->orderBy('sort_order');
    }
}
