import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Meeting } from '../types/meeting.types';

interface ParticipantAvailability {
  email: string;
  name: string;
  availableSlots: string[];
  syncedAt: string;
}

const dummyMeetingData: Record<string, Meeting & { 
  participantDetails: ParticipantAvailability[];
  invitations: { email: string; status: 'pending' | 'accepted' | 'declined'; }[];
}> = {
  '1': {
    id: '1',
    title: 'Team Weekly Sync',
    dateRange: 'May 9-15, 2025',
    duration: '2 days',
    participants: 9,
    status: 'scheduled',
    scheduledDate: 'May 9-10, 2025',
    organizer: 'John Doe',
    participantEmails: ['alice@example.com', 'bob@example.com', 'charlie@example.com'],
    availableSlots: [
      { date: 'May 9-10, 2025', participants: 9 },
      { date: 'May 11-12, 2025', participants: 7 },
      { date: 'May 13-14, 2025', participants: 6 },
    ],
    participantDetails: [
      {
        email: 'alice@example.com',
        name: 'Alice Johnson',
        availableSlots: ['May 9-10', 'May 11-12', 'May 13-14'],
        syncedAt: '2025-05-05 10:30 AM'
      },
      {
        email: 'bob@example.com',
        name: 'Bob Smith',
        availableSlots: ['May 9-10', 'May 11-12'],
        syncedAt: '2025-05-05 09:15 AM'
      },
      {
        email: 'charlie@example.com',
        name: 'Charlie Brown',
        availableSlots: ['May 9-10', 'May 11-12'],
        syncedAt: '2025-05-05 11:45 AM'
      }
    ],
    invitations: [
      { email: 'alice@example.com', status: 'accepted' },
      { email: 'bob@example.com', status: 'accepted' },
      { email: 'charlie@example.com', status: 'pending' },
      { email: 'david@example.com', status: 'pending' },
      { email: 'eve@example.com', status: 'declined' },
    ]
  }
};

const OrganizerMeetingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<typeof dummyMeetingData['1'] | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'availability' | 'invitations'>('overview');

  useEffect(() => {
    // In real app, fetch meeting data from API
    if (id && dummyMeetingData[id]) {
      setMeeting(dummyMeetingData[id]);
    }
  }, [id]);

  if (!meeting) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Meeting not found</h2>
            <button 
              onClick={() => navigate('/meetings')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Meetings
            </button>
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

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/meetings')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Meetings
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{meeting.title}</h1>
          </div>
          <div className="flex space-x-3">
            <button 
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
              onClick={() => navigate(`/edit-meeting/${id}`)}
            >
              Edit Meeting
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Share Link
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}>
            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'availability'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Availability
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invitations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Invitations
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Meeting Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date Range</label>
                  <p className="mt-1 text-sm text-gray-900">{meeting.dateRange}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="mt-1 text-sm text-gray-900">{meeting.duration}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Participants</label>
                  <p className="mt-1 text-sm text-gray-900">{meeting.participants} people</p>
                </div>
                {meeting.scheduledDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scheduled For</label>
                    <p className="mt-1 text-sm text-gray-900">{meeting.scheduledDate}</p>
                  </div>
                )}
              </div>
            </div>

            {meeting.availableSlots && meeting.availableSlots.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Slots</h2>
                <div className="space-y-4">
                  {meeting.availableSlots.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{slot.date}</p>
                        <p className="text-sm text-gray-500">{slot.participants} participants available</p>
                      </div>
                      {meeting.status === 'pending' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                          Select This Slot
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Participant Availability</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Slots</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Synced At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {meeting.participantDetails.map((participant, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {participant.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {participant.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {participant.availableSlots.join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {participant.syncedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Invitations</h2>
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-sm">
                  Add Participants
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {meeting.invitations.map((invitation, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invitation.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getInvitationStatusColor(invitation.status)}`}>
                            {invitation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {invitation.status === 'pending' && (
                              <button className="text-blue-600 hover:text-blue-900">
                                Resend
                              </button>
                            )}
                            <button className="text-red-600 hover:text-red-900">
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default OrganizerMeetingDetail;