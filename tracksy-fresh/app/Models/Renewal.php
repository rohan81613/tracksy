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
        $today    = Carbon::today();
        $upcoming = $this->getUpcomingRenewalDateAttribute();
        $diff     = $today->diffInDays($upcoming, false);

        if ($diff < 0) return 'overdue';
        if ($diff === 0) return 'due-today';
        if ($diff <= 30) return 'upcoming';
        return 'active';
    }

    public function getDaysUntilRenewalAttribute(): int
    {
        $upcoming = $this->getUpcomingRenewalDateAttribute();
        return (int) Carbon::today()->diffInDays($upcoming, false);
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

    /**
     * Computes the next upcoming renewal date based on purchase_date and billing_cycle.
     * Starting from purchase_date, advances by one billing cycle at a time until
     * the date is today or in the future.
     * Falls back to renewal_date-based calculation when purchase_date is not set.
     */
    public function getUpcomingRenewalDateAttribute(): Carbon
    {
        $today = Carbon::today();

        if ($this->purchase_date) {
            $anchor = $this->purchase_date->copy();
            $iterations = 0;
            while ($anchor->lt($today) && $iterations < 1200) {
                $anchor = $this->billing_cycle === 'yearly'
                    ? $anchor->addYear()
                    : $anchor->addMonth();
                $iterations++;
            }
            return $anchor;
        }

        // Fallback: advance renewal_date until >= today
        $anchor = $this->renewal_date->copy();
        $iterations = 0;
        while ($anchor->lt($today) && $iterations < 1200) {
            $anchor = $this->billing_cycle === 'yearly'
                ? $anchor->addYear()
                : $anchor->addMonth();
            $iterations++;
        }
        return $anchor;
    }

    /**
     * @deprecated Use upcoming_renewal_date instead.
     */
    public function getNextRenewalDateAttribute(): Carbon
    {
        return $this->getUpcomingRenewalDateAttribute();
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    /**
     * Upcoming scope: renewals whose computed upcoming_renewal_date falls within the next $days days.
     * Because the upcoming date is computed (not stored), we fetch candidates and filter in PHP.
     */
    public function scopeUpcoming($query, int $days = 30)
    {
        $today = Carbon::today();
        // Fetch all non-deleted renewals for this user and filter by computed upcoming date
        return $query->get()->filter(function ($renewal) use ($today, $days) {
            $upcoming = $renewal->upcoming_renewal_date;
            $diff = $today->diffInDays($upcoming, false);
            return $diff >= 0 && $diff <= $days;
        });
    }

    public function scopeOverdue($query)
    {
        // Overdue: upcoming_renewal_date is in the past
        return $query->get()->filter(function ($renewal) {
            $diff = Carbon::today()->diffInDays($renewal->upcoming_renewal_date, false);
            return $diff < 0;
        });
    }

    public function scopeDueForReminder($query)
    {
        // SQLite-compatible: filter in PHP after fetching candidates within the next 30 days
        return $query->whereBetween('renewal_date', [
            Carbon::today(),
            Carbon::today()->addDays(30),
        ])->get()->filter(function ($renewal) {
            $reminderDate = Carbon::parse($renewal->renewal_date)->subDays($renewal->reminder_days);
            return $reminderDate->isToday();
        });
    }
}
