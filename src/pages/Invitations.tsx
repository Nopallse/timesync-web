import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import type { Meeting } from '../types/meeting.types';

const Invitations: React.FC = () => {
  const [invitations, setInvitations] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch invitations
    const fetchInvitations = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockInvitations: Meeting[] = [
          {
            id: '1',
            title: 'Project Kickoff Meeting',
            dateRange: 'May 10-12, 2025',
            duration: '60 minutes',
            participants: 5,
            status: 'pending',
            availableSlots: [
              { date: 'May 10, 2025 - 10:00 AM', participants: 5 },
              { date: 'May 11, 2025 - 2:00 PM', participants: 4 },
              { date: 'May 12, 2025 - 11:00 AM', participants: 3 }
            ],
            organizer: 'alex@example.com',
            participantEmails: ['user@example.com', 'alex@example.com', 'sarah@example.com', 'mike@example.com', 'lisa@example.com']
          },
          {
            id: '2',
            title: 'Quarterly Review',
            dateRange: 'May 15-20, 2025',
            duration: '90 minutes',
            participants: 8,
            status: 'pending',
            availableSlots: [
              { date: 'May 16, 2025 - 1:00 PM', participants: 7 },
              { date: 'May 17, 2025 - 11:00 AM', participants: 6 },
              { date: 'May 19, 2025 - 3:00 PM', participants: 8 }
            ],
            organizer: 'sarah@example.com',
            participantEmails: ['user@example.com', 'alex@example.com', 'sarah@example.com', 'mike@example.com', 'lisa@example.com', 'john@example.com', 'emma@example.com', 'david@example.com']
          },
          {
            id: '3',
            title: 'Product Demo',
            dateRange: 'May 25-30, 2025',
            duration: '45 minutes',
            participants: 4,
            status: 'scheduled',
            scheduledDate: 'May 27, 2025 - 2:00 PM',
            organizer: 'mike@example.com',
            participantEmails: ['user@example.com', 'mike@example.com', 'sarah@example.com', 'david@example.com']
          }
        ];
        
        setInvitations(mockInvitations);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleRespondToInvitation = async (meetingId: string, response: 'accept' | 'decline') => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setInvitations(prev => 
        prev.map(invitation => 
          invitation.id === meetingId 
            ? { ...invitation, status: response === 'accept' ? 'scheduled' : 'cancelled' } 
            : invitation
        )
      );
    } catch (error) {
      console.error(`Error ${response}ing invitation:`, error);
    }
  };

  const handleSelectTimeSlot = async (meetingId: string, slotIndex: number) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setInvitations(prev => 
        prev.map(invitation => {
          if (invitation.id === meetingId && invitation.availableSlots) {
            const selectedSlot = invitation.availableSlots[slotIndex];
            return { 
              ...invitation, 
              status: 'scheduled',
              scheduledDate: selectedSlot.date
            };
          }
          return invitation;
        })
      );
    } catch (error) {
      console.error('Error selecting time slot:', error);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Invitations</h1>
        
        {invitations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No invitations</h3>
            <p className="mt-1 text-gray-500">You don't have any meeting invitations at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {invitations.map(invitation => (
              <div key={invitation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-l-4 border-blue-500 p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-gray-900">{invitation.title}</h2>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invitation.status === 'scheduled' ? 'bg-green-100 text-green-800' : 
                        invitation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="flex items-center">
                      <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Organized by: {invitation.organizer}
                    </p>
                    <p className="flex items-center mt-1">
                      <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {invitation.dateRange}
                    </p>
                    <p className="flex items-center mt-1">
                      <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {invitation.duration}
                    </p>
                    <p className="flex items-center mt-1">
                      <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {invitation.participants} participants
                    </p>
                  </div>

                  {invitation.status === 'scheduled' && invitation.scheduledDate && (
                    <div className="mt-4 p-4 bg-green-50 rounded-md">
                      <p className="text-sm font-medium text-green-800 flex items-center">
                        <svg className="mr-1.5 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Meeting scheduled for: {invitation.scheduledDate}
                      </p>
                    </div>
                  )}

                  {invitation.status === 'pending' && (
                    <div className="mt-4">
                      {invitation.availableSlots && (
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Available time slots:</h3>
                          <div className="space-y-2">
                            {invitation.availableSlots.map((slot, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                                <div>
                                  <span className="font-medium text-gray-900">{slot.date}</span>
                                  <span className="ml-2 text-sm text-gray-500">({slot.participants} of {invitation.participants} available)</span>
                                </div>
                                <button
                                  onClick={() => handleSelectTimeSlot(invitation.id, index)}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  Select
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-4">
                        <Button
                          onClick={() => handleRespondToInvitation(invitation.id, 'accept')}
                          className="flex-1"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleRespondToInvitation(invitation.id, 'decline')}
                          variant="outline"
                          className="flex-1"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
};

export default Invitations;