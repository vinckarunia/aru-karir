<?php

namespace App\Notifications;

use App\Models\JobListing;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationSubmitted extends Notification implements ShouldQueue
{
    use Queueable;

    public $candidate;
    public $jobListing;

    /**
     * Create a new notification instance.
     */
    public function __construct($candidate, JobListing $jobListing)
    {
        $this->candidate = $candidate;
        $this->jobListing = $jobListing;
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
            ->subject('Lamaran Pekerjaan Diterima - ARUKarir')
            ->view('emails.application_submitted', [
                'candidate' => $this->candidate,
                'jobListing' => $this->jobListing,
            ]);
    }
}
