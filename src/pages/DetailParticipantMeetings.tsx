import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Meeting } from '../types/meeting.types';
import { meetingService } from '../services/meeting.service';
import { calendarService } from '../services/calendar.service';
import MeetingCalendar from '../components/Meeting/MeetingCalendar';

interface ParticipantMeetingDetails extends Meeting {
  invitationStatus?: 'accepted' | 'declined' | 'pending';
  calendarEvents?: {
    available: string[];
    unavailable: string[];
  };
  selectedDates?: string[];
}

interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  isConflict: boolean;
}

const DetailParticipantMeetings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState<ParticipantMeetingDetails | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useParams<{ token: string }>();
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const meetingData = await meetingService.getMeetingById(id);
        console.log('Meeting data:', meetingData);
        // Determine invitation status from the meeting data
        let invitationStatus: 'accepted' | 'declined' | 'pending' = 'pending';
        if (meetingData.hasResponded === true) {
          invitationStatus = 'accepted';
        }
        
        setMeeting({
          ...meetingData,
          invitationStatus
        });
      } catch (err) {
        console.error('Error fetching meeting details:', err);
        setError('Failed to load meeting details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeetingDetails();
  }, [id]);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!token) {
        setError('Meeting token is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const meetingData = await meetingService.getMeetingByToken(token);
        // Set the meeting data
        setMeeting(meetingData);
      } catch (err: any) {
        console.error('Error fetching meeting:', err);
        setError(err.response?.data?.message || 'Failed to load meeting information');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMeeting();
    }
  }, [token]);

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSyncStatusColor = (syncStatus: string) => {
    switch (syncStatus) {
      case 'synced':
        return 'bg-green-100 text-green-800';
      case 'not-synced':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSyncCalendar = async () => {
    if (!id || !meeting) return;
    
    setIsSyncing(true);
    try {
      // Parse date range and time constraints
      const [startDateStr, endDateStr] = meeting.dateRange.split(' to ');
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      // Add null check before destructuring timeRange
      if (!meeting.timeRange) {
        throw new Error("Time range is not defined");
      }
      const { startTime, endTime } = meeting.timeRange;
      const duration = typeof meeting.duration === 'string' ? parseInt(meeting.duration, 10) : meeting.duration;
      
      // Get events from calendar for this date range
      const events = await calendarService.getEvents(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      // Generate all possible time slots
      const allTimeSlots = generateTimeSlots(startDate, endDate, startTime, endTime, duration);
      
      // Identify user's available and conflict slots
      const availableSlots: AvailabilitySlot[] = [];
      const conflictSlots: AvailabilitySlot[] = [];
      
      allTimeSlots.forEach(slot => {
        const slotStart = new Date(`${slot.date}T${slot.startTime}`);
        const slotEnd = new Date(`${slot.date}T${slot.endTime}`);
        
        // Check if this slot conflicts with any calendar event
        const hasConflict = events.some(event => {
          const eventStart = new Date(event.start.dateTime || event.start.date);
          const eventEnd = new Date(event.end.dateTime || event.end.date);
          
          // Check for overlap
          return (
            (slotStart >= eventStart && slotStart < eventEnd) ||
            (slotEnd > eventStart && slotEnd <= eventEnd) ||
            (slotStart <= eventStart && slotEnd >= eventEnd)
          );
        });
        
        if (hasConflict) {
          conflictSlots.push({
            date: slot.date, // Just use the date without time
            startTime: slot.startTime,
            endTime: slot.endTime,
            isConflict: true
          });
        } else {
          availableSlots.push({
            date: slot.date, // Just use the date without time
            startTime: slot.startTime,
            endTime: slot.endTime,
            isConflict: false
          });
        }
      });
      
      // Store all slots for reference
      setAvailabilitySlots([...availableSlots, ...conflictSlots]);
      
      // Format data for backend in the expected structure
      // Instead of just sending the dates, we'll send objects with date, startTime, and endTime
      const formattedAvailableSlots = availableSlots.map(slot => ({
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime
      }));
      
      // Submit availability to backend - we need to modify the meetingService.submitAvailability function
      await meetingService.submitAvailability(id, formattedAvailableSlots);
      
      // Update local state
      setMeeting(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          hasResponded: true,
          invitationStatus: 'accepted'
        };
      });
    } catch (error) {
      console.error('Error syncing calendar:', error);
      setError('Failed to sync your calendar. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Generate all possible time slots based on form inputs
  const generateTimeSlots = (
    startDate: Date, 
    endDate: Date, 
    startTime: string, 
    endTime: string, 
    duration: number
  ) => {
    const slots = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    // Loop through each day in the date range
    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Parse start and end time
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      // Set current time to start time
      let currentSlotTime = new Date(currentDate);
      currentSlotTime.setHours(startHour, startMinute, 0, 0);
      
      // Set end time for the day
      let endTimeForDay = new Date(currentDate);
      endTimeForDay.setHours(endHour, endMinute, 0, 0);
      
      // Generate slots for this day
      while (currentSlotTime.getTime() + duration * 60 * 60 * 1000 <= endTimeForDay.getTime()) {
        const slotEndTime = new Date(currentSlotTime.getTime() + duration * 60 * 60 * 1000);
        
        slots.push({
          date: dateStr,
          startTime: currentSlotTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          endTime: slotEndTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          available: 0,
          participants: []
        });
        
        // Move to next slot
        currentSlotTime = slotEndTime;
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return slots;
  };

  const handleAcceptInvitation = async () => {
    if (!meeting?.participantToken) return;
    
    setIsActioning(true);
    try {
      await meetingService.respondToInvitation(meeting.participantToken, 'accepted');
      
      setMeeting(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          invitationStatus: 'accepted'
        };
      });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation. Please try again.');
    } finally {
      setIsActioning(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!meeting?.participantToken) return;
    
    setIsActioning(true);
    try {
      await meetingService.respondToInvitation(meeting.participantToken, 'declined');
      
      setMeeting(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          invitationStatus: 'declined'
        };
      });
    } catch (error) {
      console.error('Error declining invitation:', error);
      setError('Failed to decline invitation. Please try again.');
    } finally {
      setIsActioning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Meeting not found</p>
              <button 
                onClick={() => navigate('/meetings')}
                className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600"
              >
                Go Back to Meetings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/meetings')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Meetings
      </button>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
              <p className="text-sm text-gray-500 mt-2">Organized by {meeting.organizer}</p>
            </div>
            <div className="flex space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}>
                <span className="capitalize">{meeting.status}</span>
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSyncStatusColor(meeting.hasResponded ? 'synced' : 'not-synced')}`}>
                {meeting.hasResponded === true ? 'Calendar Synced' : 'Not Synced'}
              </span>
            </div>
          </div>
        </div>

        {/* Meeting Details */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Meeting Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Date Range</p>
              <p className="text-sm text-gray-900">{meeting.dateRange}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-sm text-gray-900">{meeting.duration} hour(s)</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Participants</p>
              <p className="text-sm text-gray-900">{meeting.participants} people</p>
            </div>
            {meeting.scheduledDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Scheduled Date</p>
                <p className="text-sm text-gray-900">{formatDate(meeting.scheduledDate)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar View */}
        <div className="p-6 border-b border-gray-200">
          <MeetingCalendar
            dateRange={meeting.dateRange}
            duration={meeting.duration}
            timeRange={meeting.timeRange || { startTime: '08:00', endTime: '17:00' }}
            participantEmails={meeting.participantEmails || []}
            availableSlots={meeting.availableSlots || []}
          />
        </div>

        {/* Availability Summary (only show when synced) */}
        {meeting.hasResponded && availabilitySlots.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Availability Summary</h2>
            <div>
              <p className="text-sm text-gray-700 mb-2">
                You are available for {availabilitySlots.filter(slot => !slot.isConflict).length} out of {availabilitySlots.length} possible time slots.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {availabilitySlots
                  .filter(slot => !slot.isConflict)
                  .slice(0, 4)
                  .map((slot, index) => {
                    return (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-sm font-medium text-green-800">
                            {new Date(slot.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })} · {slot.startTime} - {slot.endTime}
                          </p>
                        </div>
                      </div>
                    );
                  })
                }
                {availabilitySlots.filter(slot => !slot.isConflict).length > 4 && (
                  <div className="bg-gray-50 rounded-md p-3 border flex items-center justify-center">
                    <p className="text-sm text-gray-600">
                      + {availabilitySlots.filter(slot => !slot.isConflict).length - 4} more available times
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Participants</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="text-sm font-medium text-gray-900">{meeting.organizer} (Organizer)</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Organizer
              </span>
            </div>
            {meeting.participantEmails && meeting.participantEmails.map((email, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <p className="text-sm text-gray-900">{email}</p>
                {email === meeting.participantEmails[0] && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInvitationStatusColor(meeting.invitationStatus || 'pending')}`}>
                    You ({meeting.invitationStatus || 'pending'})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Sync and Actions */}
        <div className="p-6">
          {meeting.status === 'pending' && (
            <div className="mb-6">
              {meeting.hasResponded === false && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Please sync your calendar to help the organizer find the best date for the meeting.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                {meeting.hasResponded === false ? (
                  <button
                    onClick={handleSyncCalendar}
                    disabled={isSyncing}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-1.647z"></path>
                        </svg>
                        Syncing...
                      </span>
                    ) : (
                      'Sync Calendar'
                    )}
                  </button>
                ) : (
                  <div className="text-sm text-green-600">
                    ✓ Calendar synced successfully
                  </div>
                )}

                {(meeting.invitationStatus === 'pending' || !meeting.invitationStatus) && (
                  <>
                    <button
                      onClick={handleAcceptInvitation}
                      disabled={isActioning}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {isActioning ? 'Processing...' : 'Accept Invitation'}
                    </button>
                    <button
                      onClick={handleDeclineInvitation}
                      disabled={isActioning}
                      className="inline-flex items-center px-4 py-2 border border-red-600 rounded-md text-sm font-medium text-red-600 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                      {isActioning ? 'Processing...' : 'Decline Invitation'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {meeting.invitationStatus === 'accepted' && (
            <div className="text-sm text-green-600">
              ✓ You have accepted this invitation
            </div>
          )}

          {meeting.invitationStatus === 'declined' && (
            <div className="text-sm text-red-600">
              ✗ You have declined this invitation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailParticipantMeetings;