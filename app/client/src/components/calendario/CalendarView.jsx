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
      eventContent={(eventInfo) => (
        <div className="custom-event">
          <div className="event-title">{eventInfo.event.title}</div>
          {eventInfo.event.extendedProps.location && (
            <div className="event-location">
              📍 {eventInfo.event.extendedProps.location}
            </div>
          )}
        </div>
      )}
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
