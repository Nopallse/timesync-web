import React, { useState } from 'react';
import OrganizerMeetings from '../components/Meeting/OrganizerMeetings';
import ParticipantMeetings from '../components/Meeting/ParticipantMeetings';

const MeetingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'organizer' | 'participant'>('organizer');

  return (

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Meetings</h1>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('organizer')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'organizer'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              As Organizer
            </button>
            <button
              onClick={() => setActiveTab('participant')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'participant'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              As Participant
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'organizer' ? <OrganizerMeetings /> : <ParticipantMeetings />}
        </div>
      </div>
  );
};

export default MeetingPage;