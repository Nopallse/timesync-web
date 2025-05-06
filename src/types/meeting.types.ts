export interface Meeting {
  success: any;
  id: string;
  title: string;
  dateRange: string;
  duration: string;
  participants: number;
  isOrganizer: boolean;
  hasResponded: boolean;
  participantToken: string;
  status: 'pending' | 'scheduled' | 'cancelled';
  availableSlots?: Array<{
    date: string;
    participants: number;
  }>;
  scheduledDate?: string;
  scheduledTime?: string;
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