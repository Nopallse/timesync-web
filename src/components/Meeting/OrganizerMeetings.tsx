import React, { useState } from 'react';
import type { Meeting } from '../../types/meeting.types';
import { useNavigate } from 'react-router-dom';

// Dummy data for organizer meetings
const dummyOrganizerMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Team Weekly Sync',
    dateRange: 'May 9-15, 2025',
    duration: '2 days',
    participants: 9,
    status: 'scheduled',
    scheduledDate: 'May 9-10, 2025',
    organizer: 'John Doe',
    participantEmails: [],
  },
  {
    id: '2',
    title: 'Project Kickoff',
    dateRange: 'May 12-20, 2025',
    duration: '3 days',
    participants: 15,
    status: 'pending',
    organizer: 'John Doe',
    participantEmails: [],
  },
  {
    id: '3',
    title: 'Stakeholder Review',
    dateRange: 'May 15-25, 2025',
    duration: '1 day',
    participants: 5,
    status: 'cancelled',
    organizer: 'John Doe',
    participantEmails: [],
  },
];

const OrganizerMeetings: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>(dummyOrganizerMeetings);
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

  const getStatusIcon = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleViewDetails = (meetingId: string) => {
    navigate(`/meetings/organizer/${meetingId}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Meetings I Organize</h2>
        <button
          onClick={() => navigate('/create-meeting')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Create New Meeting
        </button>
      </div>

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                  {getStatusIcon(meeting.status)}
                  <span className="ml-1 capitalize">{meeting.status}</span>
                </span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
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

            <div className="mt-6 flex space-x-4">
              <button 
                onClick={() => handleViewDetails(meeting.id)}
                className="inline-flex items-center px-3 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
              >
                View Details
              </button>
              {meeting.status === 'pending' && (
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  View Availability
                </button>
              )}
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Edit Meeting
              </button>
              {meeting.status !== 'cancelled' && (
                <button className="inline-flex items-center px-3 py-2 border border-red-600 rounded-md text-sm font-medium text-red-600 bg-white hover:bg-red-50">
                  Cancel Meeting
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {meetings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No meetings</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new meeting.</p>
        </div>
      )}
    </div>
  );
};

export default OrganizerMeetings;