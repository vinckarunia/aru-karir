<?php

namespace App\Notifications;

use App\Models\JobListing;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InterviewScheduled extends Notification implements ShouldQueue
{
    use Queueable;

    public $candidate;
    public $jobListing;
    public $stageName;
    public $scheduleNotes;

    /**
     * Create a new notification instance.
     */
    public function __construct($candidate, JobListing $jobListing, string $stageName, ?string $scheduleNotes = null)
    {
        $this->candidate = $candidate;
        $this->jobListing = $jobListing;
        $this->stageName = $stageName;
        $this->scheduleNotes = $scheduleNotes;
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
        $subject = $this->stageName === 'interview_hr' 
            ? 'Undangan Interview HR - ARUKarir' 
            : 'Undangan Interview Client - ARUKarir';

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.interview_scheduled', [
                'candidate' => $this->candidate,
                'jobListing' => $this->jobListing,
                'stageName' => $this->stageName,
                'scheduleNotes' => $this->scheduleNotes,
            ]);
    }
}
