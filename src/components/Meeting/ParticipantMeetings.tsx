import React, { useState } from 'react';
import type { Meeting } from '../../types/meeting.types';
import { useNavigate } from 'react-router-dom';

// Dummy data for participant meetings
const dummyParticipantMeetings: Meeting[] = [
  {
    id: '4',
    title: 'Marketing Strategy Meeting',
    dateRange: 'May 8-12, 2025',
    duration: '1 day',
    participants: 6,
    status: 'scheduled',
    scheduledDate: 'May 9, 2025',
    organizer: 'Jane Smith',
    participantEmails: [],
  },
  {
    id: '5',
    title: 'Client Presentation',
    dateRange: 'May 14-18, 2025',
    duration: '2 days',
    participants: 10,
    status: 'pending',
    organizer: 'Mike Johnson',
    participantEmails: [],
  },
];

interface ParticipantMeetingEvent extends Meeting {
  syncStatus: 'synced' | 'not-synced';
}

const ParticipantMeetings: React.FC = () => {
  const [meetings, setMeetings] = useState<ParticipantMeetingEvent[]>(
    dummyParticipantMeetings.map(meeting => ({
      ...meeting,
      syncStatus: Math.random() > 0.5 ? 'synced' : 'not-synced'
    }))
  );

  const navigate = useNavigate();


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

  const getSyncStatusColor = (status: ParticipantMeetingEvent['syncStatus']) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-800';
      case 'not-synced':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSyncCalendar = (meetingId: string) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId 
        ? { ...meeting, syncStatus: 'synced' } 
        : meeting
    ));
  };

  const handleViewDetails = (meetingId: string) => {
    navigate(`/meetings/participant/${meetingId}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Meetings I'm Invited To</h2>

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Organized by {meeting.organizer}</p>
              </div>
              <div className="flex space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                  <span className="capitalize">{meeting.status}</span>
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSyncStatusColor(meeting.syncStatus)}`}>
                  {meeting.syncStatus === 'synced' ? 'Calendar Synced' : 'Not Synced'}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Date Range:</span> {meeting.dateRange}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Duration:</span> {meeting.duration}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Participants:</span> {meeting.participants} people
              </div>
              {meeting.scheduledDate && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Scheduled For:</span> {meeting.scheduledDate}
                </div>
              )}
            </div>

            {meeting.status === 'pending' && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      The organizer is finding a suitable date. Please sync your calendar to help them find the best time.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex space-x-4">
              {meeting.syncStatus === 'not-synced' && (
                <button
                  onClick={() => handleSyncCalendar(meeting.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync Calendar
                </button>
              )}
              <button 
                onClick={() => handleViewDetails(meeting.id)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                View Details
              </button>
              {meeting.status === 'pending' && (
                <button className="inline-flex items-center px-3 py-2 border border-red-600 rounded-md text-sm font-medium text-red-600 bg-white hover:bg-red-50">
                  Decline Invitation
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {meetings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No meeting invitations</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't been invited to any meetings yet.</p>
        </div>
      )}
    </div>
  );
};

export default ParticipantMeetings;