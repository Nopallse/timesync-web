import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MeetingForm from '../components/Meeting/MeetingForm';
import type { CreateMeetingForm } from '../types/meeting.types';
import { meetingService } from '../services/meeting.service';

const CreateMeeting: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (formData: CreateMeetingForm) => {
    setLoading(true);
    setError(null);
    
    try {
      await meetingService.createMeeting(formData);
      setSuccess(true);
    } catch (err: any) {
      console.error('Error creating meeting:', err);
      setError(err.response?.data?.message || 'Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create a New Meeting</h1>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
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
            Your meeting has been created and invitations will be sent to participants once scheduled.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => {
                setSuccess(false);
                setError(null);
              }}
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