import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Common/Button';
import ParticipantList from '../components/Meeting/ParticipantList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import type { Meeting } from '../types/meeting.types';

const MeetingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmingSchedule, setConfirmingSchedule] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        // In a real app, this would be an API call
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data for the selected meeting
        const mockMeeting: Meeting = {
          id: id || '1',
          title: 'Q2 Product Planning Meeting',
          dateRange: 'May 5 - May 15, 2025',
          duration: '60 minutes',
          participants: 8,
          status: 'pending',
          organizer: 'John Doe',
          participantEmails: [
            'alice@example.com',
            'bob@example.com',
            'charlie@example.com',
            'david@example.com',
            'ellen@example.com',
            'frank@example.com',
            'grace@example.com',
            'henry@example.com'
          ],
          availableSlots: [
            { date: 'May 9, 2025 - 10:00 AM', participants: 8 },
            { date: 'May 10, 2025 - 2:00 PM', participants: 7 },
            { date: 'May 12, 2025 - 11:00 AM', participants: 6 },
            { date: 'May 14, 2025 - 3:00 PM', participants: 5 }
          ]
        };
        
        setMeeting(mockMeeting);
      } catch (error) {
        console.error('Error fetching meeting:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeeting();
  }, [id]);

  const handleScheduleMeeting = async () => {
    if (!selectedSlot) return;
    
    try {
      setScheduling(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update meeting status and date
      setMeeting(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          status: 'scheduled',
          scheduledDate: selectedSlot
        };
      });
      
      setConfirmingSchedule(false);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    } finally {
      setScheduling(false);
    }
  };

  const handleResendInvite = (email: string) => {
    // In a real app, this would trigger an API call to resend the invitation
    console.log(`Resending invitation to ${email}`);
    alert(`Invitation resent to ${email}`);
  };

  const copyMeetingLink = () => {
    const meetingLink = `${window.location.origin}/meeting/${id}`;
    navigator.clipboard.writeText(meetingLink);
    
    setShowCopiedTooltip(true);
    setTimeout(() => setShowCopiedTooltip(false), 2000);
  };

  const handleCancelMeeting = async () => {
    if (window.confirm('Are you sure you want to cancel this meeting?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMeeting(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            status: 'cancelled'
          };
        });
      } catch (error) {
        console.error('Error cancelling meeting:', error);
      }
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
    );
  }

  if (!meeting) {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Meeting not found</h1>
            <p className="mt-2 text-gray-600">The meeting you're looking for doesn't exist or has been removed.</p>
            <Button 
              variant="primary" 
              className="mt-4"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
    );
  }

  // Transform participant emails to required format for ParticipantList
  const participantListData = meeting.participantEmails.map((email, index) => {
    // For demo purposes, make some participants confirmed, some pending
    let status: 'confirmed' | 'pending' | 'declined' = 'pending';
    
    if (index % 3 === 0) {
      status = 'confirmed';
    } else if (index % 7 === 0) {
      status = 'declined';
    }
    
    return {
      email,
      status,
      syncStatus: status === 'confirmed' ? 'synced' as const : 'not_synced' as const
    };
  });

  const getStatusBadgeClass = (status: string) => {
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

  return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Meeting Header */}
        <div className="border-b border-gray-200 pb-5 mb-6">
          <div className="flex flex-wrap items-baseline justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(meeting.status)}`}>
              {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
            </span>
          </div>
          
          <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {meeting.dateRange}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {meeting.duration}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              Organized by {meeting.organizer}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {meeting.status === 'pending' && (
              <Button
                variant="primary"
                onClick={() => setConfirmingSchedule(true)}
                disabled={!meeting.availableSlots || meeting.availableSlots.length === 0}
              >
                Schedule Meeting
              </Button>
            )}
            
            <div className="relative">
              <Button
                variant="outline"
                onClick={copyMeetingLink}
              >
                Copy Meeting Link
              </Button>
              {showCopiedTooltip && (
                <div className="absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded shadow-lg">
                  Copied!
                </div>
              )}
            </div>
            
            {meeting.status !== 'cancelled' && (
              <Button
                variant="secondary"
                onClick={handleCancelMeeting}
              >
                Cancel Meeting
              </Button>
            )}
          </div>
        </div>

        {/* Scheduled Date Info (if meeting is scheduled) */}
        {meeting.status === 'scheduled' && meeting.scheduledDate && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Meeting Scheduled</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>This meeting has been scheduled for:</p>
                  <p className="font-medium mt-1">{meeting.scheduledDate}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="text-sm font-medium text-green-800 hover:text-green-700"
                  >
                    Add to calendar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scheduling Modal */}
        {confirmingSchedule && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Schedule Meeting</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Select a time slot from the available options below. This will finalize the meeting time for all participants.
                        </p>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        {meeting.availableSlots && meeting.availableSlots.map((slot, index) => (
                          <div 
                            key={index}
                            className={`border rounded-md p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedSlot === slot.date ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                            onClick={() => setSelectedSlot(slot.date)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${selectedSlot === slot.date ? 'border-blue-500' : 'border-gray-300'}`}>
                                  {selectedSlot === slot.date && (
                                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                  )}
                                </div>
                                <span className="ml-2 text-gray-900">{slot.date}</span>
                              </div>
                              <span className="text-sm text-blue-600 font-medium">{slot.participants}/{meeting.participants} available</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    variant="primary"
                    onClick={handleScheduleMeeting}
                    disabled={!selectedSlot || scheduling}
                    className="w-full sm:w-auto sm:ml-3"
                  >
                    {scheduling ? 'Scheduling...' : 'Confirm Schedule'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmingSchedule(false)}
                    disabled={scheduling}
                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancelled Meeting Notice */}
        {meeting.status === 'cancelled' && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Meeting Cancelled</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>This meeting has been cancelled by the organizer.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meeting Details Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Time Slots */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden rounded-md">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {meeting.status === 'scheduled' ? 'Selected Time' : 'Available Time Slots'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {meeting.status === 'scheduled' 
                    ? 'The meeting has been scheduled at the time below.'
                    : 'Based on participants\' availability, these are the best times for the meeting.'}
                </p>
              </div>
              
              <div className="bg-white px-4 py-5 sm:p-6">
                {meeting.status === 'scheduled' && meeting.scheduledDate ? (
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-800 font-medium">{meeting.scheduledDate}</span>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {participantListData
                        .filter(p => p.status === 'confirmed')
                        .map((participant, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {participant.email}
                          </span>
                        ))}
                    </div>
                  </div>
                ) : meeting.status === 'cancelled' ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>Meeting has been cancelled. No time slots are available.</p>
                  </div>
                ) : meeting.availableSlots && meeting.availableSlots.length > 0 ? (
                  <div className="space-y-4">
                    {meeting.availableSlots.map((slot, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{slot.date}</span>
                          <span className="text-sm text-blue-600">{slot.participants}/{meeting.participants} available</span>
                        </div>
                        
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${(slot.participants / meeting.participants) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No availability data found. Participants need to sync their calendars.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow overflow-hidden rounded-md">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Participants ({meeting.participants})
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  People invited to this meeting
                </p>
              </div>
              
              <div className="bg-white px-4 py-5 sm:p-6">
                <ParticipantList 
                  participants={participantListData}
                  onResendInvite={handleResendInvite}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};


export default MeetingDetails;