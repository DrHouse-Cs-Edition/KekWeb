// CalendarView.jsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function CalendarView({ events, handleDateSelect, handleEventClick, locale }) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
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
    />
  );
}