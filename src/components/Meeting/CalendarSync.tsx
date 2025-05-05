import React, { useState } from 'react';
import Button from '../Common/Button';

interface CalendarSyncProps {
  onSyncComplete?: () => void;
  alreadySynced?: boolean;
  calendarType?: 'google' | 'outlook' | 'apple';
}

const CalendarSync: React.FC<CalendarSyncProps> = ({ 
  onSyncComplete, 
  alreadySynced = false,
  calendarType = 'google'
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(alreadySynced);

  const handleSync = async () => {
    setSyncing(true);
    
    // Simulate API request to sync calendar
    setTimeout(() => {
      setSyncing(false);
      setSyncComplete(true);
      if (onSyncComplete) {
        onSyncComplete();
      }
    }, 2000);
  };

  const getCalendarIcon = () => {
    switch (calendarType) {
      case 'google':
        return (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'outlook':
        return (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L12 2L20 6V18L12 22L4 18V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 10L12 14L20 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 2V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'apple':
        return (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  const getCalendarName = () => {
    switch (calendarType) {
      case 'google':
        return 'Google Calendar';
      case 'outlook':
        return 'Outlook Calendar';
      case 'apple':
        return 'Apple Calendar';
      default:
        return 'Calendar';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${syncComplete ? 'bg-green-100' : 'bg-blue-100'}`}>
          <span className={syncComplete ? 'text-green-600' : 'text-blue-600'}>
            {getCalendarIcon()}
          </span>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{getCalendarName()}</h3>
          <p className="text-sm text-gray-500">
            {syncComplete 
              ? 'Your calendar is synced with TimeSync' 
              : 'Allow TimeSync to read your availability'}
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        {syncComplete ? (
          <div className="flex items-center text-green-700 bg-green-50 px-4 py-3 rounded-md">
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Calendar successfully synchronized
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-gray-600">
              TimeSync needs access to your calendar to check your availability. 
              We only check your busy/free status and don't read event details.
            </p>
            <Button
              onClick={handleSync}
              disabled={syncing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {syncing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-1.647z"></path>
                  </svg>
                  Syncing...
                </span>
              ) : (
                `Connect ${getCalendarName()}`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSync;