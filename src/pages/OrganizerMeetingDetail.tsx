import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Meeting } from '../types/meeting.types';
import { meetingService } from '../services/meeting.service';
import LoadingSpinner from '../components/Common/LoadingSpinner';

interface ParticipantAvailability {
  id: string;
  email: string;
  name: string;
  availableDates: string[];
  lastUpdated: string;
  hasResponded: boolean;
}

interface MeetingDetail extends Meeting {
  participantDetails: ParticipantAvailability[];
  invitations: { 
    id: string;
    email: string; 
    status: 'pending' | 'accepted' | 'declined';
  }[];
}

const OrganizerMeetingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'availability' | 'invitations'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for invitation link generation
  const [invitationLink, setInvitationLink] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // State for adding participants
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const meetingData = await meetingService.getMeetingById(id);
        setMeeting({
          ...meetingData,
          participantDetails: [],
          invitations: []
        });
      } catch (err: any) {
        console.error('Error fetching meeting details:', err);
        setError(err.response?.data?.message || 'Failed to load meeting details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeetingDetails();
  }, [id]);

  // Function to generate invitation link
  const generateInvitationLink = async () => {
    if (!meeting) return;
    
    try {
      setIsGeneratingLink(true);
      
      const response = await meetingService.generateInvitation(meeting.id);
      
      if (response.success) {
        setInvitationLink(response.invitation.url);
      }
    } catch (error) {
      console.error('Error generating invitation link:', error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Function to copy link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(invitationLink);
    setLinkCopied(true);
    
    // Reset copied state after 3 seconds
    setTimeout(() => {
      setLinkCopied(false);
    }, 3000);
  };
  
  // Function to invite a participant by email
  const inviteParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meeting) return;
    if (!newParticipantEmail.trim()) {
      setInviteError('Please enter an email address');
      return;
    }
    
    try {
      setIsInviting(true);
      setInviteError(null);
      
      const response = await meetingService.inviteParticipants(meeting.id, [newParticipantEmail]);
      
      if (response.success) {
        // Update the invitations list
        setMeeting(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            invitations: [
              ...prev.invitations,
              { 
                id: response.participants[0].participantId, 
                email: newParticipantEmail, 
                status: 'pending' 
              }
            ]
          };
        });
        
        setNewParticipantEmail('');
        setInviteSuccess(true);
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setInviteSuccess(false);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error inviting participant:', error);
      setInviteError(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };
  
  // Function to schedule a meeting at a specific slot
  const scheduleMeeting = async (date: string) => {
    if (!meeting) return;
    
    try {
      const [scheduledDate, scheduledTime] = date.split(' at ');
      
      const confirmed = window.confirm(
        `Are you sure you want to schedule this meeting for ${date}?`
      );
      
      if (!confirmed) return;
      
      const response = await meetingService.scheduleMeeting(
        meeting.id,
        scheduledDate,
        scheduledTime || '09:00'
      );
      
      if (response.success) {
        // Update the meeting with scheduled information
        setMeeting(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            status: 'scheduled',
            scheduledDate: scheduledDate,
            scheduledTime: scheduledTime
          };
        });
        
        // Show success message
        alert('Meeting scheduled successfully! Participants will be notified.');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    }
  };
  
  // Function to resend invitation
  const resendInvitation = async (email: string) => {
    if (!meeting) return;
    
    try {
      await meetingService.inviteParticipants(meeting.id, [email]);
      alert(`Invitation resent to ${email}`);
    } catch (error) {
      console.error('Error resending invitation:', error);
      alert('Failed to resend invitation. Please try again.');
    }
  };
  
  // Function to remove participant
  const removeParticipant = async (participantId: string, email: string) => {
    if (!meeting) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to remove ${email} from this meeting?`
    );
    
    if (!confirmed) return;
    
    try {
      await meetingService.removeParticipant(meeting.id, participantId);
      
      // Update meeting data
      setMeeting(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          invitations: prev.invitations.filter(inv => inv.id !== participantId)
        };
      });
      
      alert(`${email} has been removed from the meeting`);
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('Failed to remove participant. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error loading meeting</h2>
          <p className="mt-2 text-red-600">{error}</p>
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
              <div>
                <label className="text-sm font-medium text-gray-500">Time Window</label>
                <p className="mt-1 text-sm text-gray-900">
                  {meeting.timeRange?.startTime} - {meeting.timeRange?.endTime}
                </p>
              </div>
              {meeting.scheduledDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Scheduled For</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {meeting.scheduledDate} {meeting.scheduledTime && `at ${meeting.scheduledTime}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Share Meeting Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Share Meeting</h2>
            
            {!invitationLink ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Generate a shareable link that allows participants to join this meeting and provide their availability.
                </p>
                <button
                  onClick={generateInvitationLink}
                  disabled={isGeneratingLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isGeneratingLink ? 'Generating...' : 'Generate Invitation Link'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Share this link with participants:
                </p>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={invitationLink}
                    readOnly
                    className="flex-grow p-2 border border-gray-300 rounded-l-md bg-gray-50"
                  />
                  <button
                    onClick={copyLinkToClipboard}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    {linkCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
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
                      <button 
                        onClick={() => scheduleMeeting(slot.date)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
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
            {meeting.participantDetails && meeting.participantDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {meeting.participantDetails.map((participant, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {participant.name || 'Guest'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {participant.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {participant.hasResponded 
                            ? participant.availableDates.join(', ') 
                            : 'No response yet'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {participant.lastUpdated 
                            ? new Date(participant.lastUpdated).toLocaleString() 
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No participant availability data yet. Invite participants to see their availability.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'invitations' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Invitations</h2>
            </div>
            
            {/* Add Participant Form */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">Invite Participant</h3>
              <form onSubmit={inviteParticipant} className="flex items-center">
                <div className="flex-grow mr-2">
                  <input
                    type="email"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isInviting}
                  />
                  {inviteError && (
                    <p className="mt-1 text-xs text-red-600">{inviteError}</p>
                  )}
                  {inviteSuccess && (
                    <p className="mt-1 text-xs text-green-600">Invitation sent successfully!</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isInviting || !newParticipantEmail.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isInviting ? 'Sending...' : 'Send Invite'}
                </button>
              </form>
            </div>
            
            {meeting.invitations && meeting.invitations.length > 0 ? (
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
                              <button 
                                onClick={() => resendInvitation(invitation.email)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Resend
                              </button>
                            )}
                            <button 
                              onClick={() => removeParticipant(invitation.id, invitation.email)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No invitations sent yet. Use the form above to invite participants.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerMeetingDetail;