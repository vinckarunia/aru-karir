<?php

namespace App\Notifications;

use App\Models\JobListing;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OfferingSent extends Notification implements ShouldQueue
{
    use Queueable;

    public $candidate;
    public $jobListing;
    public $notes;

    /**
     * Create a new notification instance.
     */
    public function __construct($candidate, JobListing $jobListing, ?string $notes = null)
    {
        $this->candidate = $candidate;
        $this->jobListing = $jobListing;
        $this->notes = $notes;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Penawaran Kerja (Offering Letter) - ARUKarir')
            ->view('emails.offering_sent', [
                'candidate' => $this->candidate,
                'jobListing' => $this->jobListing,
                'notes' => $this->notes,
            ]);
    }
}
