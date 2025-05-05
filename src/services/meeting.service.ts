import type { Meeting, CreateMeetingForm } from '../types/meeting.types';
import { v4 as uuidv4 } from 'uuid';

class MeetingService {
  private storageKey = 'meetings';
  
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getStoredMeetings(): Meeting[] {
    const meetingsJson = localStorage.getItem(this.storageKey);
    return meetingsJson ? JSON.parse(meetingsJson) : [];
  }

  private storeMeetings(meetings: Meeting[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(meetings));
  }

  async createMeeting(meetingData: CreateMeetingForm, organizerId: string): Promise<Meeting> {
    // Simulate API call delay
    await this.delay(1200);
    
    const currentMeetings = this.getStoredMeetings();
    
    // Generate available slots for the date range
    const startDate = new Date(meetingData.startDate);
    const endDate = new Date(meetingData.endDate);
    const availableSlots = [];
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Skip weekends
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        availableSlots.push({
          date: currentDate.toISOString().split('T')[0],
          participants: Math.floor(Math.random() * (meetingData.participantEmails.length + 1)), // Random number of available participants
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Sort slots by participants available (highest first)
    availableSlots.sort((a, b) => b.participants - a.participants);
    
    const newMeeting: Meeting = {
      id: uuidv4(),
      title: meetingData.title,
      dateRange: `${meetingData.startDate} to ${meetingData.endDate}`,
      duration: `${meetingData.duration} ${meetingData.duration === 1 ? 'hour' : 'hours'}`,
      participants: meetingData.participantEmails.length,
      status: 'pending',
      availableSlots,
      organizer: organizerId,
      participantEmails: meetingData.participantEmails,
    };
    
    currentMeetings.push(newMeeting);
    this.storeMeetings(currentMeetings);
    
    return newMeeting;
  }

  async getMeetings(userId: string): Promise<Meeting[]> {
    // Simulate API call delay
    await this.delay(800);
    
    // In a real app, we would filter by organizer or participant
    const meetings = this.getStoredMeetings();
    return meetings.filter(meeting => 
      meeting.organizer === userId || 
      meeting.participantEmails.includes('user@example.com') // Using the mock user email
    );
  }

  async getMeeting(meetingId: string): Promise<Meeting | null> {
    // Simulate API call delay
    await this.delay(600);
    
    const meetings = this.getStoredMeetings();
    const meeting = meetings.find(m => m.id === meetingId);
    
    return meeting || null;
  }

  async scheduleDate(meetingId: string, date: string): Promise<Meeting> {
    // Simulate API call delay
    await this.delay(1000);
    
    const meetings = this.getStoredMeetings();
    const meetingIndex = meetings.findIndex(m => m.id === meetingId);
    
    if (meetingIndex === -1) {
      throw new Error('Meeting not found');
    }
    
    // Update the meeting
    meetings[meetingIndex] = {
      ...meetings[meetingIndex],
      status: 'scheduled',
      scheduledDate: date,
    };
    
    this.storeMeetings(meetings);
    return meetings[meetingIndex];
  }

  async cancelMeeting(meetingId: string): Promise<void> {
    // Simulate API call delay
    await this.delay(800);
    
    const meetings = this.getStoredMeetings();
    const meetingIndex = meetings.findIndex(m => m.id === meetingId);
    
    if (meetingIndex === -1) {
      throw new Error('Meeting not found');
    }
    
    // Update the meeting status
    meetings[meetingIndex] = {
      ...meetings[meetingIndex],
      status: 'cancelled',
    };
    
    this.storeMeetings(meetings);
  }

  async getInvitations(userEmail: string): Promise<Meeting[]> {
    // Simulate API call delay
    await this.delay(700);
    
    const meetings = this.getStoredMeetings();
    return meetings.filter(
      meeting => meeting.participantEmails.includes(userEmail) && 
      meeting.status === 'pending'
    );
  }

  async respondToInvitation(meetingId: string, userEmail: string, accepted: boolean): Promise<void> {
    // Simulate API call delay
    await this.delay(900);
    
    // In a real app, we would track responses from participants
    console.log(`User ${userEmail} ${accepted ? 'accepted' : 'declined'} invitation to meeting ${meetingId}`);
  }
}

export const meetingService = new MeetingService();