import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Meeting } from '../types/meeting.types';

interface ParticipantMeetingDetails extends Meeting {
  syncStatus: 'synced' | 'not-synced';
  invitationStatus: 'accepted' | 'declined' | 'pending';
  calendarEvents?: {
    available: string[];
    unavailable: string[];
  };
  selectedDates?: string[];
}

const dummyMeetingDetails: ParticipantMeetingDetails = {
  id: '4',
  title: 'Marketing Strategy Meeting',
  dateRange: 'May 8-12, 2025',
  duration: '1 day',
  participants: 6,
  status: 'pending',
  scheduledDate: undefined,
  organizer: 'Jane Smith',
  participantEmails: [
    'john.doe@example.com',
    'alice.smith@example.com',
    'bob.wilson@example.com',
    'carol.davis@example.com',
    'dave.miller@example.com'
  ],
  syncStatus: 'not-synced',
  invitationStatus: 'pending',
  calendarEvents: {
    available: ['2025-05-08', '2025-05-09', '2025-05-10', '2025-05-11', '2025-05-12'],
    unavailable: []
  },
  selectedDates: [],
  availableSlots: [
    { date: 'May 9, 2025', participants: 5 },
    { date: 'May 10, 2025', participants: 4 },
    { date: 'May 11, 2025', participants: 6 },
    { date: 'May 12, 2025', participants: 3 }
  ]
};

const DetailParticipantMeetings: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState<ParticipantMeetingDetails>(dummyMeetingDetails);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

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

  const getSyncStatusColor = (status: ParticipantMeetingDetails['syncStatus']) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-800';
      case 'not-synced':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvitationStatusColor = (status: ParticipantMeetingDetails['invitationStatus']) => {
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
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSyncCalendar = async () => {
    setIsSyncing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMeeting(prev => ({ ...prev, syncStatus: 'synced' }));
    } catch (error) {
      console.error('Error syncing calendar:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAcceptInvitation = async () => {
    setIsActioning(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMeeting(prev => ({ ...prev, invitationStatus: 'accepted' }));
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setIsActioning(false);
    }
  };

  const handleDeclineInvitation = async () => {
    setIsActioning(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMeeting(prev => ({ ...prev, invitationStatus: 'declined' }));
    } catch (error) {
      console.error('Error declining invitation:', error);
    } finally {
      setIsActioning(false);
    }
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
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSyncStatusColor(meeting.syncStatus)}`}>
                  {meeting.syncStatus === 'synced' ? 'Calendar Synced' : 'Not Synced'}
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
                <p className="text-sm text-gray-900">{meeting.duration}</p>
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

          {/* Available Dates */}
          {meeting.status === 'pending' && meeting.availableSlots && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Dates</h2>
              <div className="space-y-2">
                {meeting.availableSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(slot.date)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {slot.participants} available
                      </span>
                    </div>
                  </div>
                ))}
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
              {meeting.participantEmails.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <p className="text-sm text-gray-900">{email}</p>
                  {email === 'john.doe@example.com' && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInvitationStatusColor(meeting.invitationStatus)}`}>
                      You ({meeting.invitationStatus})
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
                {meeting.syncStatus === 'not-synced' && (
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
                  {meeting.syncStatus === 'not-synced' ? (
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

                  {meeting.invitationStatus === 'pending' && (
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