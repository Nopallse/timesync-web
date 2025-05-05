import React from 'react';
import { Link } from 'react-router-dom';
import type { Meeting } from '../../types/meeting.types';

interface MeetingCardProps {
  meeting: Meeting;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting }) => {
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
    <Link to={`/meeting/${meeting.id}`} className="block">
      <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="border-l-4 border-blue-500 p-5">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(meeting.status)}`}>
              {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
            </span>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            <p className="flex items-center">
              <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {meeting.dateRange}
            </p>
            <p className="flex items-center mt-1">
              <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {meeting.duration}
            </p>
            <p className="flex items-center mt-1">
              <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              {meeting.participants} participants
            </p>
          </div>

          {meeting.status === 'scheduled' && meeting.scheduledDate && (
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-800">
                Scheduled for: {meeting.scheduledDate}
              </p>
            </div>
          )}

          {meeting.status === 'pending' && meeting.availableSlots && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Top availability:</p>
              <div className="space-y-1">
                {meeting.availableSlots.map((slot, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-600">{slot.date}</span>
                    <span className="text-xs font-medium text-blue-600">{slot.participants} available</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MeetingCard;