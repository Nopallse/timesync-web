// Calendar service to handle calendar integration and availability checking
import type { User } from '../types/user.types';

interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

class CalendarService {
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async connectGoogleCalendar(user: User): Promise<boolean> {
    // Simulate API call to connect Google Calendar
    await this.delay(1500);
    
    // In a real implementation, this would redirect to Google OAuth flow
    // and store the access token
    localStorage.setItem('calendarConnected', 'true');
    
    return true;
  }

  async disconnectCalendar(user: User): Promise<boolean> {
    // Simulate API call to disconnect calendar
    await this.delay(800);
    
    localStorage.removeItem('calendarConnected');
    
    return true;
  }

  async isCalendarConnected(user: User): Promise<boolean> {
    // Simulate API call
    await this.delay(500);
    
    return localStorage.getItem('calendarConnected') === 'true';
  }

  async getUserAvailability(user: User, startDate: Date, endDate: Date): Promise<AvailabilitySlot[]> {
    // Simulate API call to get user availability
    await this.delay(1200);
    
    // Mock data - in real application this would come from the calendar API
    const availabilitySlots: AvailabilitySlot[] = [];
    
    // Generate some random availability slots for the date range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Skip weekends
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        availabilitySlots.push({
          date: currentDate.toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00',
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return availabilitySlots;
  }

  async getUserEvents(user: User, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    // Simulate API call to get user events
    await this.delay(1000);
    
    // Mock data - in real application this would be fetched from calendar API
    const events: CalendarEvent[] = [];
    
    // Generate some random events
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Skip weekends and add random events on some weekdays
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6 && Math.random() > 0.6) {
        const eventStart = new Date(currentDate);
        eventStart.setHours(9 + Math.floor(Math.random() * 7), 0, 0); // Between 9 AM and 4 PM
        
        const eventEnd = new Date(eventStart);
        eventEnd.setHours(eventStart.getHours() + 1 + Math.floor(Math.random() * 2)); // 1-2 hours duration
        
        events.push({
          id: `event-${events.length + 1}`,
          title: 'Busy', // We don't expose actual event titles for privacy
          start: eventStart,
          end: eventEnd,
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return events;
  }
}

export const calendarService = new CalendarService();