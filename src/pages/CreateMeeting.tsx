import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import MeetingForm from '../components/Meeting/MeetingForm';
import type { CreateMeetingForm } from '../types/meeting.types';

const CreateMeeting: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: CreateMeetingForm) => {
    setLoading(true);
    
    try {
      console.log('Creating meeting with data:', formData);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create a New Meeting</h1>
        
        {!success ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <MeetingForm onSubmit={handleSubmit} loading={loading} />
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Meeting Created Successfully!</h2>
            <p className="text-green-600 mb-6">
              Your meeting has been created and invitations have been sent to all participants.
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => setSuccess(false)}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Create Another Meeting
              </button>
            </div>
          </div>
        )}
      </div>
  );
};

export default CreateMeeting;