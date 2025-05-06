import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { meetingService } from '../services/meeting.service';

const ParticipantPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Get email from query params if available
  const searchParams = new URLSearchParams(location.search);
  const emailFromParams = searchParams.get('email');
  const participantToken = searchParams.get('token');
  useEffect(() => {
    const fetchMeeting = async () => {
      if (!token) {
        setError('Meeting token is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const meetingData = await meetingService.getMeetingByToken(token);
        // Set the meeting data
        setMeeting(meetingData);
      } catch (err: any) {
        console.error('Error fetching meeting:', err);
        setError(err.response?.data?.message || 'Failed to load meeting information');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMeeting();
    }
  }, [token]);
  
  const handleDateToggle = (date: string) => {
    setSelectedDates(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date);
      } else {
        return [...prev, date];
      }
    });
  };
  
  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      setError('Please select at least one date when you are available');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const payload: any = {
        availableDates: selectedDates
      };
      
      // Add email or token depending on authentication status
      if (user) {
        // User is authenticated
        payload.email = user.email;
      } else if (participantToken) {
        // User has a participant token
        payload.participantToken = participantToken;
      } else if (emailFromParams) {
        // User came from email link
        payload.email = emailFromParams;
      } else {
        setError('Unable to identify you. Please log in or provide your email');
        setSubmitting(false);
        return;
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/invitation/meetings/${meeting.id}/availability`,
        payload,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Error submitting availability:', err);
      setError(err.response?.data?.message || 'Failed to submit your availability');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Generate array of dates within the date range
  const generateDateArray = (startDate: string, endDate: string) => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Clone start date
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  
  if (!meeting) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Meeting Not Found</h2>
          <p className="text-yellow-600">The meeting you're looking for doesn't exist or the invitation link is invalid.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h2>
          <p className="text-green-600 mb-4">
            Your availability has been submitted successfully. You'll be notified when the meeting is scheduled.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  
  // Extract date range
  const [startDateStr, endDateStr] = meeting?.dateRange?.split(' to ') || [];
  const availableDates = generateDateArray(startDateStr, endDateStr);
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
      <p className="text-gray-600 mb-6">Please select all dates when you're available for this meeting.</p>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Meeting Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Date Range</label>
            <p className="mt-1 text-sm text-gray-900">{meeting.dateRange}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Duration</label>
            <p className="mt-1 text-sm text-gray-900">{meeting.duration}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Time Window</label>
            <p className="mt-1 text-sm text-gray-900">
              {meeting.timeRange?.startTime} - {meeting.timeRange?.endTime}
            </p>
          </div>
          {meeting.status === 'scheduled' && (
            <div>
              <label className="text-sm font-medium text-gray-500">Scheduled For</label>
              <p className="mt-1 text-sm text-gray-900">{meeting.scheduledDate} at {meeting.scheduledTime}</p>
            </div>
          )}
        </div>
        
        {meeting.status === 'pending' && (
          <>
            <h3 className="text-md font-medium text-gray-700 mb-3">Select Your Available Dates</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
              {availableDates.map(date => (
                <div 
                  key={date}
                  onClick={() => handleDateToggle(date)}
                  className={`p-3 border rounded-md cursor-pointer text-center transition-colors ${
                    selectedDates.includes(date)
                      ? 'bg-blue-100 border-blue-500 text-blue-800'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              ))}
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting || selectedDates.length === 0}
                className={`px-4 py-2 rounded-md text-white ${
                  submitting || selectedDates.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Availability'}
              </button>
            </div>
          </>
        )}
        
        {meeting.status === 'scheduled' && (
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-green-800">
              This meeting has been scheduled. Please check your calendar or email for details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantPage;