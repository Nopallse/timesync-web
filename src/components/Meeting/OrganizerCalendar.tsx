import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { calendarService } from '../../services/calendar.service';

interface MeetingCalendarProps {
  dateRange: string;
  duration: string | number;
  timeRange?: {
    startTime: string;
    endTime: string;
  };
  participantEmails: string[];
  availableSlots?: Array<{
    date: string;
    participants: number;
  }>;
  onSlotSelect?: (slot: any) => void;
}

interface SelectedSlot {
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  totalParticipants: number;
  hasConflict: boolean;
}

const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  dateRange,
  duration,
  timeRange = { startTime: '08:00', endTime: '17:00' },
  participantEmails,
  availableSlots = [],
  onSlotSelect
}) => {
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedSlots, setGeneratedSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  
  useEffect(() => {
    const fetchAndSetupCalendar = async () => {
      try {
        setLoading(true);
        
        // Parse date range and time constraints
        const [startDateStr, endDateStr] = dateRange.split(' to ');
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        // Convert duration to number (hours)
        const durationHours = typeof duration === 'string' 
          ? parseInt(duration, 10) 
          : duration;
        
        // Get events from calendar for this date range
        const events = await calendarService.getEvents(
          startDate.toISOString(),
          endDate.toISOString()
        );
        
        // Format events for calendar
        const formattedEvents = events.map((event: any) => ({
          title: event.summary || 'Busy',
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          backgroundColor: 'rgba(220, 38, 38, 0.2)', // red with transparency
          borderColor: '#dc2626',
          textColor: '#991b1b',
          extendedProps: {
            type: 'existing'
          }
        }));
        
        // Generate all possible time slots
        const slots = generateTimeSlots(startDate, endDate, timeRange.startTime, timeRange.endTime, durationHours);
        
        // Format the slots as events
        const slotEvents = slots.map(slot => {
          // Find if this slot has data in availableSlots
          const availableSlot = availableSlots.find(as => 
            as.date === slot.date || 
            as.date === `${slot.date}T${slot.startTime}-${slot.endTime}`
          );
          
          // Get the base participant count from availableSlots
          let participants = availableSlot ? availableSlot.participants : 0;
          
          // Determine if this slot conflicts with calendar
          const slotStart = new Date(`${slot.date}T${slot.startTime}`);
          const slotEnd = new Date(`${slot.date}T${slot.endTime}`);
          
          const hasConflict = events.some((event: any) => {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            const eventEnd = new Date(event.end.dateTime || event.end.date);
            
            return (
              (slotStart >= eventStart && slotStart < eventEnd) ||
              (slotEnd > eventStart && slotEnd <= eventEnd) ||
              (slotStart <= eventStart && slotEnd >= eventEnd)
            );
          });
          
          // If current user doesn't have a conflict, consider them available
          // Only increment if we're not already counting them (based on availableSlots)
          if (!hasConflict && participants === 0) {
            participants = 1; // Current user is available
          }
          
          // Calculate total participants (including current user if available)
          const totalParticipants = participantEmails.length + (hasConflict ? 0 : 1);
          
          // Create event for calendar
          return {
            title: hasConflict ? `Conflict (${participants} available)` : `${participants} available`,
            start: `${slot.date}T${slot.startTime}`,
            end: `${slot.date}T${slot.endTime}`,
            backgroundColor: hasConflict 
              ? 'rgba(220, 38, 38, 0.1)' // red with more transparency for conflicts
              : participants > 0 
                ? `rgba(59, 130, 246, ${0.3 + Math.min(participants / totalParticipants * 0.7, 0.7)})` // blue with opacity based on availability
                : 'rgba(156, 163, 175, 0.2)', // gray for no participants
            borderColor: hasConflict 
              ? '#dc2626' 
              : participants > 0 
                ? '#3b82f6' 
                : '#9ca3af',
            textColor: hasConflict 
              ? '#991b1b' 
              : participants > 0 
                ? '#1e40af' 
                : '#4b5563',
            extendedProps: {
              type: 'slot',
              participants: participants,
              totalParticipants: totalParticipants,
              hasConflict: hasConflict,
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime
            }
          };
        });
        
        setGeneratedSlots(slots);
        setCalendarEvents([...formattedEvents, ...slotEvents]);
      } catch (err) {
        console.error('Error setting up calendar:', err);
        setError('Failed to load calendar data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndSetupCalendar();
  }, [dateRange, duration, timeRange, participantEmails, availableSlots]);

  const renderEventContent = (eventInfo: any) => {
    const { extendedProps } = eventInfo.event;
    
    if (extendedProps.type === 'existing') {
      return (
        <div className="fc-event-content overflow-hidden">
          <div className="fc-event-title text-xs truncate">
            <svg className="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {eventInfo.event.title}
          </div>
        </div>
      );
    }
    
    if (extendedProps.type === 'slot') {
      const percentage = Math.round((extendedProps.participants / extendedProps.totalParticipants) * 100);
      
      if (extendedProps.hasConflict) {
        // Modified to show both conflict status and participant availability
        return (
          <div className="fc-event-content overflow-hidden">
            <div className="fc-event-title text-xs truncate">
              <svg className="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {extendedProps.participants} / {extendedProps.totalParticipants} ({percentage}%)
            </div>
          </div>
        );
      }
      
      return (
        <div className="fc-event-content overflow-hidden">
          <div className="fc-event-title text-xs truncate">
            <svg className="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {extendedProps.participants} / {extendedProps.totalParticipants} ({percentage}%)
          </div>
        </div>
      );
    }
    
    return (
      <div className="fc-event-content overflow-hidden">
        <div className="fc-event-title text-xs truncate">
          {eventInfo.event.title}
        </div>
      </div>
    );
  };

  // Generate all possible time slots based on inputs
  const generateTimeSlots = (
    startDate: Date, 
    endDate: Date, 
    startTime: string, 
    endTime: string, 
    duration: number
  ) => {
    const slots = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    // Loop through each day in the date range
    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Parse start and end time
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      // Set current time to start time
      let currentSlotTime = new Date(currentDate);
      currentSlotTime.setHours(startHour, startMinute, 0, 0);
      
      // Set end time for the day
      let endTimeForDay = new Date(currentDate);
      endTimeForDay.setHours(endHour, endMinute, 0, 0);
      
      // Generate slots for this day
      while (currentSlotTime.getTime() + duration * 60 * 60 * 1000 <= endTimeForDay.getTime()) {
        const slotEndTime = new Date(currentSlotTime.getTime() + duration * 60 * 60 * 1000);
        
        slots.push({
          date: dateStr,
          startTime: currentSlotTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          endTime: slotEndTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        });
        
        // Move to next slot
        currentSlotTime = slotEndTime;
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return slots;
  };

  // Handler for clicking on calendar events
  const handleEventClick = (clickInfo: any) => {
    const eventProps = clickInfo.event.extendedProps;
    
    // Only process slot events, not existing calendar events
    if (eventProps.type === 'slot') {
      // Set the selected slot
      setSelectedSlot({
        date: eventProps.date,
        startTime: eventProps.startTime,
        endTime: eventProps.endTime,
        participants: eventProps.participants,
        totalParticipants: eventProps.totalParticipants,
        hasConflict: eventProps.hasConflict
      });
      
      // If there's an external handler, call it
      if (onSlotSelect) {
        onSlotSelect({
          date: eventProps.date,
          startTime: eventProps.startTime,
          endTime: eventProps.endTime,
          participants: eventProps.participants,
          totalParticipants: eventProps.totalParticipants,
          hasConflict: eventProps.hasConflict
        });
      }
    }
  };

  // Handler for the "Select This Slot" button
  const handleSelectThisSlot = () => {
    if (selectedSlot && onSlotSelect) {
      onSlotSelect(selectedSlot);
    } else if (selectedSlot) {
      alert(`Selected slot: ${selectedSlot.date} at ${selectedSlot.startTime} - ${selectedSlot.endTime}`);
    }
  };

  return (
    <div className="meeting-calendar">
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
        <div className="bg-white rounded-lg shadow-sm">
          <div className="mb-4 p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Meeting Availability Calendar</h3>
            <p className="text-sm text-gray-600 mt-1">
              Click on a time slot to view details and select it for your meeting. Your calendar events are shown in red.
            </p>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center">
                <span className="inline-block w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: 'rgba(59, 130, 246, 0.7)' }}></span>
                <span className="text-sm text-gray-700">High Availability (75-100%)</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: 'rgba(59, 130, 246, 0.4)' }}></span>
                <span className="text-sm text-gray-700">Medium Availability (25-75%)</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)' }}></span>
                <span className="text-sm text-gray-700">Conflict with Your Calendar</span>
              </div>
            </div>
            
            <div className="calendar-container border rounded">
              <FullCalendar
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek'
                }}
                events={calendarEvents}
                eventContent={renderEventContent}
                eventClick={handleEventClick}
                height="auto"
                allDaySlot={false}
                slotMinTime={timeRange.startTime}
                slotMaxTime={timeRange.endTime}
                expandRows={true}
                stickyHeaderDates={true}
                slotDuration="01:00:00"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }}
              />
            </div>
          </div>
          
          {/* Slot selection details */}
          {selectedSlot && (
            <div className="p-4 border-t bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Selected Time Slot</h4>
              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(selectedSlot.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-700 mt-1">
                      {selectedSlot.startTime} - {selectedSlot.endTime}
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedSlot.hasConflict ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {`${selectedSlot.participants} of ${selectedSlot.totalParticipants} participants available`}
                        {selectedSlot.hasConflict && (
                          <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={handleSelectThisSlot}
                    className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                      selectedSlot.hasConflict
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {selectedSlot.hasConflict ? 'Select Despite Conflict' : 'Select This Slot'}
                  </button>
                </div>
                
                {selectedSlot.hasConflict && (
                  <div className="mt-3 bg-red-50 p-3 rounded-md border border-red-100">
                    <p className="text-sm text-red-700">
                      <svg className="inline-block w-4 h-4 mr-1 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Warning: This time slot conflicts with your existing calendar events.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingCalendar;