<?php

namespace App\Console\Commands;

use App\Mail\RenewalReminderMail;
use App\Models\Renewal;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendRenewalReminders extends Command
{
    protected $signature   = 'tracksy:send-reminders';
    protected $description = 'Send renewal reminder emails to users whose renewals are due soon';

    public function handle(): int
    {
        $this->info('Checking for renewals due for reminders...');

        // Find renewals where today == renewal_date - reminder_days
        $renewals = Renewal::with('user')
            ->whereRaw('DATE_SUB(renewal_date, INTERVAL reminder_days DAY) = CURDATE()')
            ->get();

        // Also include overdue renewals (send once on the day they become overdue)
        $overdueToday = Renewal::with('user')
            ->whereDate('renewal_date', Carbon::yesterday())
            ->get();

        $all   = $renewals->merge($overdueToday);
        $count = 0;

        foreach ($all as $renewal) {
            $daysUntil = Carbon::today()->diffInDays($renewal->renewal_date, false);

            try {
                Mail::to($renewal->user->email)
                    ->queue(new RenewalReminderMail($renewal->user, $renewal, $daysUntil));
                $count++;
                $this->line("  ✓ Queued reminder for {$renewal->user->email} → {$renewal->name}");
            } catch (\Exception $e) {
                $this->error("  ✗ Failed for {$renewal->name}: {$e->getMessage()}");
            }
        }

        $this->info("Done. {$count} reminder(s) queued.");
        return Command::SUCCESS;
    }
}
