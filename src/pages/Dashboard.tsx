import React from 'react';
import { Link } from 'react-router-dom';
import MeetingCard from '../components/Meeting/MeetingCard';
import Button from '../components/Common/Button';

// Dummy data
const dummyMeetings = [
    {
      id: '1',
      title: 'Team Meeting',
      dateRange: '2025-05-05 to 2025-05-15',
      duration: '2 hours',
      participants: 9,
      status: 'pending' as 'scheduled' | 'pending' | 'cancelled',
      organizer: 'naufal@example.com',
      participantEmails: [
        'a@example.com', 'b@example.com', 'c@example.com'
      ],
      availableSlots: [
        { date: '2025-05-09', participants: 9 },
        { date: '2025-05-10', participants: 7 },
      ]
    },
    {
      id: '2',
      title: 'Project Kickoff',
      dateRange: '2025-05-08 to 2025-05-12',
      duration: '1 hour',
      participants: 5,
      status: 'scheduled' as 'scheduled' | 'pending' | 'cancelled',
      scheduledDate: '2025-05-09',
      organizer: 'naufal@example.com',
      participantEmails: [
        'd@example.com', 'e@example.com', 'f@example.com'
      ]
    },
  ];
  

const Dashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/create-meeting">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Create New Meeting
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dummyMeetings.map(meeting => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </div>

      {dummyMeetings.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No meetings</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new meeting.</p>
          <div className="mt-6">
            <Link to="/create-meeting">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Meeting
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;