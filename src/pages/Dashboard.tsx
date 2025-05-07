import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MeetingCard from '../components/Meeting/MeetingCard';
import Button from '../components/Common/Button';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../context/AuthContext';
import '../css/CalendarStyles.css'; 
import { calendarService } from '../services/calendar.service';

interface Meeting {
  id: string;
  title: string;
  dateRange: string;
  duration: string;
  participants: number;
  status: 'scheduled' | 'pending' | 'cancelled';
  organizer: string;
  participantEmails: string[];
  availableSlots?: { date: string; participants: number }[];
  scheduledDate?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: any;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<'timeGridWeek' | 'timeGridDay' | 'dayGridMonth'>('timeGridWeek');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch meetings
        // In a real implementation, this would use your meetingService to fetch meetings
        setMeetings([
          {
            id: '1',
            title: 'Team Meeting',
            dateRange: '2025-05-05 to 2025-05-15',
            duration: '2 hours',
            participants: 9,
            status: 'pending',
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
            status: 'scheduled',
            scheduledDate: '2025-05-09',
            organizer: 'naufal@example.com',
            participantEmails: [
              'd@example.com', 'e@example.com', 'f@example.com'
            ]
          },
        ]);
        
        // First check if the calendar is connected
        try {
            // Fetch real calendar events using calendarService
            const today = new Date();
            const oneMonthLater = new Date(today);
            oneMonthLater.setMonth(today.getMonth() + 1);
            
            const events = await calendarService.getEvents(
              today.toISOString(),
              oneMonthLater.toISOString()
            );
            
            // Use the formatEventsForCalendar method from calendarService
            const formattedEvents = calendarService.formatEventsForCalendar(events);
            setCalendarEvents(formattedEvents);
         
        } catch (err) {
          console.error('Error fetching calendar status or events:', err);
          setError('Failed to load your calendar data. Please check your connection and try again.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load your calendar and meetings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleEventClick = (info: any) => {
    const { event } = info;
    
    // You can display more information about the event, or navigate to a detail page
    alert(`Event: ${event.title}\nTime: ${event.start.toLocaleString()} - ${event.end.toLocaleString()}`);
  };

  const renderEventContent = (eventInfo: any) => {
    return (
      <>
        <div className="fc-event-time">
          {eventInfo.timeText}
        </div>
        <div className="fc-event-title">
          {eventInfo.event.title}
        </div>
      </>
    );
  };

  

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
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
      
      {loading ? (
        <div className="text-center py-12">
          <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-1.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500">Loading your calendar...</p>
        </div>
      ) : (
        <>
         
            <div className="mb-8 p-4 bg-white shadow rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Calendar</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setCalendarView('timeGridDay')}
                    className={`px-3 py-1 text-sm rounded-md ${calendarView === 'timeGridDay' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Day
                  </button>
                  <button 
                    onClick={() => setCalendarView('timeGridWeek')}
                    className={`px-3 py-1 text-sm rounded-md ${calendarView === 'timeGridWeek' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setCalendarView('dayGridMonth')}
                    className={`px-3 py-1 text-sm rounded-md ${calendarView === 'dayGridMonth' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Month
                  </button>
                </div>
              </div>
              <div className="calendar-container">
                <FullCalendar
                  plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                  initialView={calendarView}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: '' // We're using our custom buttons above
                  }}
                  events={calendarEvents}
                  eventContent={renderEventContent}
                  eventClick={handleEventClick}
                  height="auto"
                  slotDuration="00:30:00" // 30-minute slots
                  slotLabelInterval={{ hours: 1 }} // Label every hour
                  allDaySlot={true}
                  allDayText="All Day"
                  weekends={true}
                  nowIndicator={true} // Shows a line for the current time
                  slotMinTime="06:00:00" // Start at 6 AM
                  slotMaxTime="22:00:00" // End at 10 PM
                  expandRows={true} // Expand rows to fill height
                  stickyHeaderDates={true}
                  dayHeaderFormat={{ weekday: 'long', month: 'numeric', day: 'numeric', omitCommas: true }}
                  slotLabelFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: 'short'
                  }}
                />
              </div>
            </div>
         

          {meetings.length === 0 && (
            <div className="text-center py-12 bg-white shadow rounded-lg">
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
        </>
      )}
    </div>
  );
};

export default Dashboard;