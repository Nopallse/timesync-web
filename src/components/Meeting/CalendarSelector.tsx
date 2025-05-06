import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { calendarService } from '../../services/calendar.service';

interface CalendarSelectorProps {
  onDateRangeSelect: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({ 
  onDateRangeSelect, 
  initialStartDate, 
  initialEndDate 
}) => {
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [selectedDates, setSelectedDates] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: initialStartDate || null,
    end: initialEndDate || null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoading(true);
        
        // Fetch events for the next 3 months
        const today = new Date();
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(today.getMonth() + 3);
        
        const events = await calendarService.getEvents(
          today.toISOString(),
          threeMonthsLater.toISOString()
        );
        
        // Format events for FullCalendar
        const formattedEvents = calendarService.formatEventsForCalendar(events);
        setUserEvents(formattedEvents);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError('Failed to load your calendar events. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserEvents();
  }, []);

  const handleDateSelect = (selectInfo: any) => {
    const { startStr, endStr } = selectInfo;
    
    // FullCalendar's end date is exclusive, so we need to subtract one day
    const endDate = new Date(endStr);
    endDate.setDate(endDate.getDate() - 1);
    
    const adjustedEndStr = endDate.toISOString().split('T')[0];
    
    setSelectedDates({
      start: startStr,
      end: adjustedEndStr
    });
    
    onDateRangeSelect(startStr, adjustedEndStr);
  };

  const renderEventContent = (eventInfo: any) => {
    return (
      <div className="fc-event-content overflow-hidden">
        <div className="fc-event-title text-xs truncate">
          {eventInfo.event.title}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-selector">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-1">
          <div className="mb-3 text-sm text-gray-600">
            <span className="font-medium">Instructions:</span> Drag to select a date range for your meeting. Existing events are shown to help avoid conflicts.
          </div>

          {selectedDates.start && selectedDates.end && (
            <div className="bg-blue-50 p-3 mb-4 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Selected period:</span> {new Date(selectedDates.start).toLocaleDateString()} to {new Date(selectedDates.end).toLocaleDateString()}
              </p>
            </div>
          )}
          
          <div className="calendar-container border rounded">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              selectMirror={true}
              weekends={true}
              events={userEvents}
              select={handleDateSelect}
              eventContent={renderEventContent}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
              eventBorderColor="#4338ca"
              eventBackgroundColor="rgba(79, 70, 229, 0.3)"
              height="auto"
              aspectRatio={1.35}
              fixedWeekCount={false}
              showNonCurrentDates={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSelector;