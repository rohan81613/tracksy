<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $renewals       = $request->user()->renewals()->get();
        $notifications  = [];

        foreach ($renewals as $renewal) {
            $upcomingDate = $renewal->upcoming_renewal_date;
            $days = Carbon::today()->diffInDays($upcomingDate, false);

            if ($days >= 0 && $days <= $renewal->reminder_days) {
                $notifications[] = [
                    'id'         => "notif-{$renewal->id}",
                    'renewal_id' => (string) $renewal->id,
                    'title'      => $days === 0
                        ? "{$renewal->name} renews TODAY"
                        : "{$renewal->name} renews in {$days} day" . ($days !== 1 ? 's' : ''),
                    'subtitle'   => "\${$renewal->amount} · {$renewal->vendor}",
                    'days'       => $days,
                    'type'       => 'upcoming',
                ];
            }

            if ($days < 0) {
                $absDays = abs($days);
                $notifications[] = [
                    'id'         => "notif-overdue-{$renewal->id}",
                    'renewal_id' => (string) $renewal->id,
                    'title'      => "{$renewal->name} is overdue",
                    'subtitle'   => "Was due {$absDays} day" . ($absDays !== 1 ? 's' : '') . " ago · \${$renewal->amount}",
                    'days'       => $days,
                    'type'       => 'overdue',
                ];
            }
        }

        usort($notifications, fn($a, $b) => $a['days'] <=> $b['days']);

        return response()->json(['notifications' => $notifications]);
    }
}
