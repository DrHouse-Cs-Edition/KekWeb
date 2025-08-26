import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import styles from "./Calendario.module.css";

export default function CalendarView({
  events,
  handleDateSelect,
  handleEventClick,
  locale,
  serverDate,
}) {
  const calendarRef = useRef();

  // Update calendar when server date changes
  useEffect(() => {
    if (calendarRef.current && serverDate) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.setOption("now", serverDate); // Update the "now" date
      calendarApi.render(); // Force re-render to update highlighting
    }
  }, [serverDate]);

  const renderEventContent = (eventInfo) => {
    const eventType = eventInfo.event.extendedProps.type || "event";

    // Define icons for different event types
    const typeIcons = {
      event: "📅",
      activity: "✅",
      pomodoro: "🍅",
    };

    return (
      <div className={`${"custom-event"} ${"custom-event-" + eventType}`}>
        <div className={styles.eventTitle}>
          {typeIcons[eventType] || "📅"} {eventInfo.event.title}
        </div>
        {eventInfo.event.extendedProps.location && (
          <div className={styles.eventLocation}>
            📍 {eventInfo.event.extendedProps.location}
          </div>
        )}
        {eventType === "pomodoro" &&
          eventInfo.event.extendedProps.cyclesLeft != null && (
            <div className={styles.eventCycles}>
              Cycles: {eventInfo.event.extendedProps.cyclesLeft}
            </div>
          )}
      </div>
    );
  };

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
        rrulePlugin,
      ]}
      initialView="dayGridMonth"
      initialDate={serverDate} // Use server date for initial view
      now={serverDate} // Use server date for "today" highlighting
      headerToolbar={{
        left: "prevYear,prev today",
        center: "title",
        right: "next,nextYear",
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
      longPressDelay={1} // 1ms: almost instant tap
    />
  );
}