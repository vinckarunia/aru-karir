<?php

namespace App\Notifications;

use App\Models\JobListing;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public $candidate;
    public $jobListing;
    public $stageName;
    public $status;
    public $notes;

    /**
     * Create a new notification instance.
     */
    public function __construct($candidate, JobListing $jobListing, string $stageName, string $status, ?string $notes = null)
    {
        $this->candidate = $candidate;
        $this->jobListing = $jobListing;
        $this->stageName = $stageName;
        $this->status = $status;
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
        $subject = 'Pembaruan Status Lamaran Kerja - ARUKarir';
        if ($this->status === 'failed') {
            $subject = 'Informasi Terkait Lamaran Kerja Anda - ARUKarir';
        }

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.application_status_changed', [
                'candidate' => $this->candidate,
                'jobListing' => $this->jobListing,
                'stageName' => $this->stageName,
                'status' => $this->status,
                'notes' => $this->notes,
            ]);
    }
}
