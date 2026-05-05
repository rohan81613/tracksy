<?php

namespace App\Mail;

use App\Models\Renewal;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RenewalReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User    $user,
        public readonly Renewal $renewal,
        public readonly int     $daysUntil,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->daysUntil === 0
            ? "🔔 {$this->renewal->name} renews TODAY"
            : "⏰ {$this->renewal->name} renews in {$this->daysUntil} day" . ($this->daysUntil !== 1 ? 's' : '');

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.renewal-reminder');
    }

    public function attachments(): array
    {
        return [];
    }
}
