<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Renewal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'vendor',
        'amount',
        'amount_inr',
        'billing_cycle',
        'purchase_date',
        'renewal_date',
        'reminder_days',
        'category',
        'currency',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount'        => 'decimal:2',
            'amount_inr'    => 'decimal:2',
            'reminder_days' => 'integer',
            'purchase_date' => 'date',
            'renewal_date'  => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vendorEntries()
    {
        return $this->hasMany(VendorEntry::class)->orderBy('created_at', 'asc');
    }

    // ── Computed attributes ──────────────────────────────────────────────────

    public function getStatusAttribute(): string
    {
        $today = Carbon::today();
        $diff  = $today->diffInDays($this->renewal_date, false);

        // If renewal date is past → overdue
        if ($diff < 0) return 'overdue';

        // If renewal date is today → due-today
        if ($diff === 0) return 'due-today';

        // Within 30 days → upcoming (takes priority over purchase date check)
        if ($diff <= 30) return 'upcoming';

        // If purchase date is today or in the past and renewal > 30 days away → active
        if ($this->purchase_date && $this->purchase_date->lte($today)) {
            return 'active';
        }

        return 'active';
    }

    public function getDaysUntilRenewalAttribute(): int
    {
        return (int) Carbon::today()->diffInDays($this->renewal_date, false);
    }

    public function getMonthlyAmountAttribute(): float
    {
        return $this->billing_cycle === 'monthly'
            ? (float) $this->amount
            : (float) $this->amount / 12;
    }

    public function getYearlyAmountAttribute(): float
    {
        return $this->billing_cycle === 'yearly'
            ? (float) $this->amount
            : (float) $this->amount * 12;
    }

    public function getNextRenewalDateAttribute(): Carbon
    {
        $date  = $this->renewal_date->copy();
        $today = Carbon::today();

        if ($date->gte($today)) {
            return $this->billing_cycle === 'yearly'
                ? $date->addYear()
                : $date->addMonth();
        }

        return $this->billing_cycle === 'yearly'
            ? $today->addYear()
            : $today->addMonth();
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeUpcoming($query, int $days = 30)
    {
        return $query->whereBetween('renewal_date', [
            Carbon::today(),
            Carbon::today()->addDays($days),
        ]);
    }

    public function scopeOverdue($query)
    {
        return $query->where('renewal_date', '<', Carbon::today());
    }

    public function scopeDueForReminder($query)
    {
        return $query->whereRaw('DATE_SUB(renewal_date, INTERVAL reminder_days DAY) = CURDATE()');
    }
}
