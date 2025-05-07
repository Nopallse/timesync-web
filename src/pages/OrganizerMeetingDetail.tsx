  import React, { useState, useEffect } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import type { Meeting } from '../types/meeting.types';
  import { meetingService } from '../services/meeting.service';
  import { calendarService } from '../services/calendar.service';
  import MeetingCalendar from '../components/Meeting/OrganizerCalendar';

  interface ParticipantAvailability {
    id: string;
    email: string;
    name: string;
    availableDates: string[];
    lastUpdated: string;
    hasResponded: boolean;
  }

  interface AvailableSlot {
    date: string;
    startTime: string;
    endTime: string;
    participants: number;
    participantDetails: any[];
    isConflict?: boolean;
  }

  interface MeetingDetail extends Meeting {
    participantDetails: ParticipantAvailability[];
    availableSlots?: AvailableSlot[];
    invitations: { 
      id: string;
      email: string; 
      status: 'pending' | 'accepted' | 'declined';
    }[];
  }

  const OrganizerMeetingDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    const [slotConflicts, setSlotConflicts] = useState<Record<string, boolean>>({});
    
    // State for invitation link generation
    const [invitationLink, setInvitationLink] = useState<string>('');
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    useEffect(() => {
      const fetchMeetingDetails = async () => {
        if (!id) return;
        
        try {
          setLoading(true);
          setError(null);
          
          const meetingData = await meetingService.getMeetingById(id);
          console.log('Meeting Data:', meetingData);
          
          // Transform availableSlots if they exist
          const formattedMeeting: MeetingDetail = {
            ...meetingData,
            participantDetails: Array.isArray(meetingData.participants) ? meetingData.participants : [],
            invitations: meetingData.invitations || [],
            availableSlots: meetingData.availableSlots 
              ? meetingData.availableSlots.map((slot: any) => ({
                  date: slot.date || '',
                  startTime: slot.startTime || '',
                  endTime: slot.endTime || '',
                  participants: slot.participants || 0,
                  participantDetails: slot.participantDetails || []
                }))
              : []
          };
          
          setMeeting(formattedMeeting);
          
          // If we have date range and timeRange, fetch organizer's calendar events to check for conflicts
          if (formattedMeeting.dateRange && formattedMeeting.timeRange) {
            await fetchCalendarEvents(formattedMeeting);
          }
        } catch (err: any) {
          console.error('Error fetching meeting details:', err);
          setError(err.response?.data?.message || 'Failed to load meeting details');
        } finally {
          setLoading(false);
        }
      };
      
      fetchMeetingDetails();
    }, [id]);

    // Fetch calendar events to check for conflicts
    const fetchCalendarEvents = async (meeting: MeetingDetail) => {
      try {
        const [startDateStr, endDateStr] = meeting.dateRange.split(' to ');
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        // Get events from calendar for this date range
        const events = await calendarService.getEvents(
          startDate.toISOString(),
          endDate.toISOString()
        );
        
        setCalendarEvents(events);
        
        // Check for conflicts with meeting slots
        if (meeting.availableSlots && meeting.availableSlots.length > 0) {
          const conflicts: Record<string, boolean> = {};
          
          meeting.availableSlots.forEach(slot => {
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
            
            // Store conflict status
            const slotKey = `${slot.date}-${slot.startTime}-${slot.endTime}`;
            conflicts[slotKey] = hasConflict;
          });
          
          setSlotConflicts(conflicts);
        }
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      }
    };

    // Function to generate invitation link
    const generateInvitationLink = async () => {
      if (!meeting) return;
      
      try {
        setIsGeneratingLink(true);
        
        const response = await meetingService.generateInvitation(meeting.id);
        
        if (response.success) {
          setInvitationLink(response.invitation.url);
        }
      } catch (error) {
        console.error('Error generating invitation link:', error);
      } finally {
        setIsGeneratingLink(false);
      }
    };

    // Function to copy link to clipboard
    const copyLinkToClipboard = () => {
      navigator.clipboard.writeText(invitationLink);
      setLinkCopied(true);
      
      // Reset copied state after 3 seconds
      setTimeout(() => {
        setLinkCopied(false);
      }, 3000);
    };
    
    // Function to schedule a meeting at a specific slot
    const scheduleMeeting = async (date: string) => {
      if (!meeting) return;
      
      try {
        const [scheduledDate, scheduledTime] = date.split(' at ');
        
        const confirmed = window.confirm(
          `Are you sure you want to schedule this meeting for ${date}?`
        );
        
        if (!confirmed) return;
        
        const response = await meetingService.scheduleMeeting(
          meeting.id,
          scheduledDate,
          scheduledTime || '09:00'
        );
        
        if (response.success) {
          // Update the meeting with scheduled information
          setMeeting(prev => {
            if (!prev) return prev;
            
            return {
              ...prev,
              status: 'scheduled',
              scheduledDate: scheduledDate,
              scheduledTime: scheduledTime
            };
          });
          
          // Show success message
          alert('Meeting scheduled successfully! Participants will be notified.');
        }
      } catch (error) {
        console.error('Error scheduling meeting:', error);
        alert('Failed to schedule meeting. Please try again.');
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

    const getStatusColor = (status: string) => {
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

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Check if a slot has a conflict
    const hasConflict = (slot: AvailableSlot) => {
      const slotKey = `${slot.date}-${slot.startTime}-${slot.endTime}`;
      return slotConflicts[slotKey] || false;
    };

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

          {/* Calendar View - Using MeetingCalendar as requested */}
          <div className="p-6 border-b border-gray-200">
            <MeetingCalendar
              dateRange={meeting.dateRange}
              duration={meeting.duration}
              timeRange={meeting.timeRange || { startTime: '08:00', endTime: '17:00' }}
              participantEmails={meeting.participantEmails || []}
              availableSlots={meeting.availableSlots || []}
            />
          </div>

          {/* Available Slots Summary */}
          {meeting.availableSlots && meeting.availableSlots.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Slots Summary</h2>
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  There are {meeting.availableSlots.length} possible time slots for this meeting.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {meeting.availableSlots
                    .slice(0, 4)
                    .map((slot, index) => {
                      const conflict = hasConflict(slot);
                      
                      return (
                        <div key={index} className={`${
                          conflict 
                            ? 'bg-red-50 border-red-200' 
                            : slot.participants > 0 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                        } border rounded-md p-3`}>
                          <div className="flex items-center">
                            {conflict ? (
                              <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            <p className={`text-sm font-medium ${
                              conflict ? 'text-red-800' : 'text-green-800'
                            }`}>
                              {new Date(slot.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })} · {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                          <div className="ml-6 flex items-center mt-1">
                            <p className="text-sm text-gray-600">
                              {slot.participants} participants available
                            </p>
                            {conflict && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Conflict
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  }
                  {meeting.availableSlots.length > 4 && (
                    <div className="bg-gray-50 rounded-md p-3 border flex items-center justify-center">
                      <p className="text-sm text-gray-600">
                        + {meeting.availableSlots.length - 4} more available times
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
                  {meeting.invitations && meeting.invitations.find(inv => inv.email === email) && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      meeting.invitations.find(inv => inv.email === email)?.status === 'accepted' 
                        ? 'bg-green-100 text-green-800'
                        : meeting.invitations.find(inv => inv.email === email)?.status === 'declined'
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {meeting.invitations.find(inv => inv.email === email)?.status || 'pending'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Share Meeting Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Share Meeting</h2>
            
            {!invitationLink ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Generate a shareable link that allows participants to join this meeting and provide their availability.
                </p>
                <button
                  onClick={generateInvitationLink}
                  disabled={isGeneratingLink}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isGeneratingLink ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-1.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    'Generate Invitation Link'
                  )}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Share this link with participants:
                </p>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={invitationLink}
                    readOnly
                    className="flex-grow p-2 border border-gray-300 rounded-l-md bg-gray-50"
                  />
                  <button
                    onClick={copyLinkToClipboard}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    {linkCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
            
            {meeting.status === 'pending' && meeting.availableSlots && meeting.availableSlots.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-2">Schedule Meeting</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select one of the available slots below to schedule the meeting.
                </p>
                <div className="space-y-2">
                  {meeting.availableSlots
                    .slice(0, 3)
                    .sort((a, b) => b.participants - a.participants) // Sort by most participants
                    .map((slot, index) => {
                      const conflict = hasConflict(slot);
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(slot.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })} · {slot.startTime} - {slot.endTime}
                              </p>
                              {conflict && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Conflict
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{slot.participants} participants available</p>
                          </div>
                          <button 
                            onClick={() => scheduleMeeting(`${slot.date} at ${slot.startTime} - ${slot.endTime}`)}
                            className={`px-3 py-1 ${
                              conflict 
                                ? 'bg-yellow-600 hover:bg-yellow-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            } text-white rounded-md text-sm`}
                          >
                            {conflict ? 'Schedule Anyway' : 'Select This Slot'}
                          </button>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default OrganizerMeetingDetail;