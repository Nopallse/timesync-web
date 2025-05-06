import axios from 'axios';

const API_URL = 'http://localhost:8000';

class CalendarService {
  async getEvents(startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const params: any = {};
      if (startDate) params.timeMin = startDate;
      if (endDate) params.timeMax = endDate;
      
      const response = await axios.get(`${API_URL}/calendar/events`, {
        params,
        withCredentials: true
      });
      
      return response.data.events || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      // Return empty array on error to allow the flow to continue
      return [];
    }
  }

  async createEvent(eventData: any): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/calendar/events`, eventData, {
        withCredentials: true
      });
      
      return response.data.event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async getEventDetails(eventId: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/calendar/events/${eventId}`, {
        withCredentials: true
      });
      
      return response.data.event;
    } catch (error) {
      console.error('Error fetching event details:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, eventData: any): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/calendar/events/${eventId}`, eventData, {
        withCredentials: true
      });
      
      return response.data.event;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/calendar/events/${eventId}`, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Function to format calendar events for FullCalendar
  formatEventsForCalendar(events: any[]): any[] {
    return events.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      allDay: !event.start.dateTime,
      backgroundColor: this.getEventColor(event.colorId),
      borderColor: this.getEventColor(event.colorId),
      extendedProps: {
        description: event.description,
        location: event.location,
        status: event.status
      }
    }));
  }

  // Helper function to get color based on Google Calendar colorId
  private getEventColor(colorId?: string): string {
    const colors: {[key: string]: string} = {
      '1': '#7986CB', // Lavender
      '2': '#33B679', // Sage
      '3': '#8E24AA', // Grape
      '4': '#E67C73', // Flamingo
      '5': '#F6BF26', // Banana
      '6': '#F4511E', // Tangerine
      '7': '#039BE5', // Peacock
      '8': '#616161', // Graphite
      '9': '#3F51B5', // Blueberry
      '10': '#0B8043', // Basil
      '11': '#D50000', // Tomato
    };
    
    return colorId && colors[colorId] ? colors[colorId] : '#4285F4'; // Default to Google blue
  }

  async connectCalendar() {
    try {
      const response = await axios.get(`${API_URL}/calendar/connect`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get calendar connection status
  async getConnectionStatus() {
    try {
      const response = await axios.get(`${API_URL}/calendar/status`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

 

  // Check availability for specific time slots
  async checkTimeSlotAvailability(timeSlots: Array<{start: string, end: string}>) {
    try {
      const response = await axios.post(`${API_URL}/calendar/check-availability`, {
        timeSlots
      }, {
        withCredentials: true
      });
      return response.data.availableTimeSlots;
    } catch (error) {
      throw error;
    }
  }

  // Disconnect calendar
  async disconnectCalendar() {
    try {
      const response = await axios.delete(`${API_URL}/calendar/disconnect`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const calendarService = new CalendarService();