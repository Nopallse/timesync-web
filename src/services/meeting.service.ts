import axios from 'axios';
import type { Meeting, CreateMeetingForm } from '../types/meeting.types';

const API_URL = 'http://localhost:8000';
interface AvailabilitySlotData {
  date: string;
  startTime: string;
  endTime: string;
}

class MeetingService {
  async createMeeting(meetingData: CreateMeetingForm): Promise<Meeting> {
    try {
      const response = await axios.post(`${API_URL}/meetings`, meetingData, {
        withCredentials: true
      });
      
      return response.data.meeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  async getUserMeetings(type: string ): Promise<Meeting[]> {
    try {
      const response = await axios.get(`${API_URL}/meetings`, {
        withCredentials: true,
        params: { type }
      });
      
      return response.data.meetings;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  }

  async getMeetingById(meetingId: string): Promise<Meeting> {
    try {
      const response = await axios.get(`${API_URL}/meetings/${meetingId}`, {
        withCredentials: true
      });
      
      return response.data.meeting;
    } catch (error) {
      console.error('Error fetching meeting:', error);
      throw error;
    }
  }

  async updateMeeting(meetingId: string, updateData: any): Promise<Meeting> {
    try {
      const response = await axios.put(
        `${API_URL}/meetings/${meetingId}`,
        updateData,
        { withCredentials: true }
      );
      
      return response.data.meeting;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  /**
 * Respond to a meeting invitation
 */
async respondToInvitation(participantToken: string, response: 'accepted' | 'declined'): Promise<any> {
    const result = await axios.post(
      `http://localhost:8000/invitation/${participantToken}/respond`,
      { response },
      { withCredentials: true }
    );
    
    return result.data;

}

  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/meetings/${meetingId}`, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  async getMeetingAvailability(meetingId: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/meetings/${meetingId}/availability`, {
        withCredentials: true
      });
      
      return response.data.availableSlots;
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }
  }

  
  async submitAvailability(meetingId: string, availableSlots: AvailabilitySlotData[]): Promise<void> {
    try {
      await axios.post(`${API_URL}/meetings/${meetingId}/availability`, { availableSlots }, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error submitting availability:', error);
      throw error;
    }
  }

  // async scheduleMeeting(meetingId: string, scheduledDate: string, scheduledTime: string): Promise<Meeting> {
  //   try {
  //     const response = await axios.post(`${API_URL}/meetings/${meetingId}/schedule`, 
  //       { scheduledDate, scheduledTime }, 
  //       { withCredentials: true }
  //     );
      
  //     return response.data.meeting;
  //   } catch (error) {
  //     console.error('Error scheduling meeting:', error);
  //     throw error;
  //   }
  // }

  // Add these to your meeting.service.ts

/**
 * Generate a meeting invitation link
 */
async generateInvitation(meetingId: string): Promise<any> {
  try {
    const response = await axios.post(
      `${API_URL}/meetings/${meetingId}/invitation`,
      {},
      { withCredentials: true }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error generating invitation:', error);
    throw error;
  }
}

/**
 * Invite participants to a meeting by email
 */
async inviteParticipants(meetingId: string, emails: string[]): Promise<any> {
  try {
    const response = await axios.post(
      `${API_URL}/meetings/${meetingId}/invite`,
      { emails },
      { withCredentials: true }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error inviting participants:', error);
    throw error;
  }
}

// Service function
async getMeetingByToken(token: string): Promise<Meeting> {
  try {
    const response = await axios.get(`${API_URL}/meetings/join/${token}`, {
      withCredentials: true
    });
    const { meeting, invitation } = response.data;

    return {
      ...meeting,
      participantToken: invitation?.token,
      // Tambahkan fallback untuk field wajib lainnya kalau belum lengkap
      participants: 0,
      isOrganizer: false,
      hasResponded: 'not-synced',
      participantEmails: [],
      organizer: '',
    };
  } catch (error) {
    console.error('Error fetching meeting by token:', error);
    throw error;
  }
}


/**
 * Remove a participant from a meeting
 */
async removeParticipant(meetingId: string, participantId: string): Promise<any> {
  try {
    const response = await axios.delete(
      `${API_URL}/meetings/${meetingId}/participants/${participantId}`,
      { withCredentials: true }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
}

/**
 * Schedule a meeting at a specific date and time
 */
async scheduleMeeting(meetingId: string, scheduledDate: string, scheduledTime: string): Promise<any> {
  try {
    const response = await axios.post(
      `${API_URL}/meetings/${meetingId}/schedule`,
      { scheduledDate, scheduledTime },
      { withCredentials: true }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    throw error;
  }
}
}

export const meetingService = new MeetingService();