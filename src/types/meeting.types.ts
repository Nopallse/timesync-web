export interface Meeting {
  id: string;
  title: string;
  dateRange: string;
  duration: string;
  participants: number;
  status: 'pending' | 'scheduled' | 'cancelled';
  availableSlots?: Array<{
    date: string;
    participants: number;
  }>;
  scheduledDate?: string;
  organizer: string;
  participantEmails: string[];
  eventDays?: number;
  timeRange?: {
    startTime: string;
    endTime: string;
  };
}

export interface CreateMeetingForm {
  title: string;
  startDate: string;
  endDate: string;
  duration: number;
  participantEmails: string[];
  eventDays?: number;
  timeRange?: {
    startTime: string;
    endTime: string;
  };
}