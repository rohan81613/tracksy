<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Renewal Reminder</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; }
        .header { background: #2563eb; padding: 28px 32px; }
        .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
        .header p { color: #bfdbfe; margin: 4px 0 0; font-size: 13px; }
        .body { padding: 32px; }
        .greeting { font-size: 15px; color: #374151; margin-bottom: 20px; }
        .card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .card-title { font-size: 18px; font-weight: 700; color: #1e40af; margin: 0 0 4px; }
        .card-vendor { font-size: 13px; color: #6b7280; margin: 0 0 16px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0f2fe; font-size: 13px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #6b7280; }
        .detail-value { color: #111827; font-weight: 600; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .badge-overdue { background: #fee2e2; color: #dc2626; }
        .badge-today { background: #dbeafe; color: #2563eb; }
        .badge-soon { background: #fef3c7; color: #d97706; }
        .cta { text-align: center; margin: 24px 0; }
        .cta a { background: #2563eb; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; display: inline-block; }
        .footer { padding: 20px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; }
        .footer p { font-size: 12px; color: #9ca3af; margin: 0; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Tracksy</h1>
        <p>Renewal Management Dashboard</p>
    </div>
    <div class="body">
        <p class="greeting">Hi {{ $user->name }},</p>

        @if($daysUntil === 0)
            <p style="color:#374151;font-size:15px;">Your <strong>{{ $renewal->name }}</strong> subscription is due for renewal <strong>today</strong>. Please ensure payment is arranged.</p>
        @elseif($daysUntil < 0)
            <p style="color:#dc2626;font-size:15px;">Your <strong>{{ $renewal->name }}</strong> subscription is <strong>overdue</strong> by {{ abs($daysUntil) }} day{{ abs($daysUntil) !== 1 ? 's' : '' }}. Immediate action required.</p>
        @else
            <p style="color:#374151;font-size:15px;">Your <strong>{{ $renewal->name }}</strong> subscription renews in <strong>{{ $daysUntil }} day{{ $daysUntil !== 1 ? 's' : '' }}</strong>.</p>
        @endif

        <div class="card">
            <p class="card-title">{{ $renewal->name }}</p>
            <p class="card-vendor">{{ $renewal->vendor }}</p>
            <div class="detail-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value">${{ number_format($renewal->amount, 2) }} / {{ $renewal->billing_cycle }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Renewal Date</span>
                <span class="detail-value">{{ $renewal->renewal_date->format('F j, Y') }}</span>
            </div>
            @if($renewal->category)
            <div class="detail-row">
                <span class="detail-label">Category</span>
                <span class="detail-value">{{ $renewal->category }}</span>
            </div>
            @endif
            <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value">
                    @if($daysUntil < 0)
                        <span class="badge badge-overdue">Overdue</span>
                    @elseif($daysUntil === 0)
                        <span class="badge badge-today">Due Today</span>
                    @else
                        <span class="badge badge-soon">{{ $daysUntil }}d remaining</span>
                    @endif
                </span>
            </div>
        </div>

        <div class="cta">
            <a href="{{ config('app.frontend_url') }}" target="_blank">Open Tracksy Dashboard</a>
        </div>
    </div>
    <div class="footer">
        <p>You're receiving this because you set a reminder for this renewal in Tracksy.</p>
        <p style="margin-top:4px;">© {{ date('Y') }} Tracksy. All rights reserved.</p>
    </div>
</div>
</body>
</html>
