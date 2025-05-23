// CalendarView.jsx
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";

export default function CalendarView({
  events,
  handleDateSelect,
  handleEventClick,
  locale,
}) {
  const renderEventContent = (eventInfo) => {
    const eventType = eventInfo.event.extendedProps.type || "event";
    
    // Define icons for different event types
    const typeIcons = {
      'event': '📅',
      'activity': '✅',
      'pomodoro': '🍅'
    };
    
    return (
      <div className={`custom-event custom-event-${eventType}`}>
        <div className="event-title">
          {typeIcons[eventType] || '📅'} {eventInfo.event.title}
        </div>
        {eventInfo.event.extendedProps.location && (
          <div className="event-location">
            📍 {eventInfo.event.extendedProps.location}
          </div>
        )}
        {eventType === 'pomodoro' && eventInfo.event.extendedProps.cyclesLeft != null && (
          <div className="event-cycles">
            Cycles: {eventInfo.event.extendedProps.cyclesLeft}
          </div>
        )}
      </div>
    );
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      events={events}
      editable={true}
      selectable={true}
      selectMirror={true}
      select={handleDateSelect}
      eventClick={handleEventClick}
      locale={locale}
      eventContent={renderEventContent}
      eventDisplay="block"
      eventTimeFormat={{
        hour: "2-digit",
        minute: "2-digit",
        meridiem: false,
        hour12: false,
      }}
    />
  );
}