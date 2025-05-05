import React from 'react';

interface ParticipantListProps {
  participants: Array<{
    email: string;
    status: 'confirmed' | 'pending' | 'declined';
    syncStatus?: 'synced' | 'not_synced';
  }>;
  onResendInvite?: (email: string) => void;
}

const ParticipantList: React.FC<ParticipantListProps> = ({ 
  participants,
  onResendInvite
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSyncStatusIcon = (syncStatus?: string) => {
    if (syncStatus === 'synced') {
      return (
        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-md">
      <ul className="divide-y divide-gray-200">
        {participants.map((participant, index) => (
          <li key={index} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {participant.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{participant.email}</div>
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(participant.status)}`}>
                      {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                    </span>
                    {participant.syncStatus && (
                      <div className="ml-2 flex items-center text-sm text-gray-500">
                        {getSyncStatusIcon(participant.syncStatus)}
                        <span className="ml-1">
                          {participant.syncStatus === 'synced' ? 'Calendar synced' : 'Calendar not synced'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {participant.status === 'pending' && onResendInvite && (
                <button
                  onClick={() => onResendInvite(participant.email)}
                  className="ml-4 px-3 py-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Resend
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParticipantList;