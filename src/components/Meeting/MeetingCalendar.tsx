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
}

const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  dateRange,
  duration,
  timeRange = { startTime: '08:00', endTime: '17:00' },
  participantEmails,
  availableSlots = []
}) => {
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedSlots, setGeneratedSlots] = useState<any[]>([]);
  
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
          
          // Don't include the organizer in the participant count - removed the increment
          
          // Set total participants to just be the participant emails length
          // Organizer is not counted in total
          const totalParticipants = participantEmails.length;
          
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
              hasConflict: hasConflict
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
        
        </div>
      );
    }
    
    if (extendedProps.type === 'slot') {
      const percentage = extendedProps.totalParticipants > 0 
        ? Math.round((extendedProps.participants / extendedProps.totalParticipants) * 100) 
        : 0;
      
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
              View possible meeting slots and participant availability. Your calendar events are shown in red.
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
          
          <div className="p-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Available Slots Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {generatedSlots.slice(0, 6).map((slot, index) => {
                // Find if this slot has data in availableSlots
                const availableSlot = availableSlots.find(as => 
                  as.date === slot.date || 
                  as.date === `${slot.date}T${slot.startTime}-${slot.endTime}`
                );
                
                // Base participant count from availableSlots
                let participants = availableSlot ? availableSlot.participants : 0;
                
                // Check if this slot conflicts with user's calendar
                const slotStart = new Date(`${slot.date}T${slot.startTime}`);
                const slotEnd = new Date(`${slot.date}T${slot.endTime}`);
                
                // Find corresponding calendar event to determine if there's a conflict
                const matchingEvent = calendarEvents.find(event => 
                  event.start === `${slot.date}T${slot.startTime}` && 
                  event.end === `${slot.date}T${slot.endTime}` &&
                  event.extendedProps?.type === 'slot'
                );
                
                const hasConflict = matchingEvent?.extendedProps?.hasConflict || false;
                
                // Don't include organizer in participant count (removed the +1 logic)
                
                // Total participants is just the number of participants in the emails array
                const totalParticipants = participantEmails.length;
                
                return (
                  <div key={index} className={`${hasConflict ? 'bg-red-50 border-red-200' : 'bg-gray-50'} rounded-md p-3 border`}>
                    <p className="text-sm font-medium">
                      {new Date(slot.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {slot.startTime} - {slot.endTime}
                    </p>
                    <div className="mt-2 flex items-center">
                      {/* Show participant count and conflict badge side by side */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        hasConflict ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {`${participants} of ${totalParticipants} available`}
                      </span>
                      {hasConflict && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Conflict
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {generatedSlots.length > 6 && (
                <div className="bg-gray-50 rounded-md p-3 border flex items-center justify-center">
                  <p className="text-sm text-gray-600">
                    + {generatedSlots.length - 6} more slots
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingCalendar;