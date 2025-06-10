import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Timer, Check,} from 'lucide-react';
import { v4 as uuidv4 } from "uuid";
import { RRule } from "rrule";
import EventModal from './EventModal';
import styles from './mobileCalendar.module.css';

const MobileCalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // Represents the date whose events are shown in the summary
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEvent, setNewEvent] = useState({
    id: "",
    title: "",
    type: "event",
    cyclesLeft: null,
    activityDate: null,
    start: new Date(),
    end: new Date(),
    location: "",
    recurrenceRule: "",
    desc: "",
  });

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = () => {
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          const formattedEvents = json.list.map((event) => {
            const formattedEvent = {
              id: event._id,
              title: event.title,
              extendedProps: {
                type: event.type,
                cyclesLeft: event.cyclesLeft,
                location: event.location,
                recurrenceRule: event.recurrenceRule,
                desc: event.description,
                activityDate: event.activityDate ? new Date(event.activityDate) : null,
              },
            };

            switch (event.type) {
              case "activity":
                const activityDate = event.activityDate ? new Date(event.activityDate) : new Date();
                formattedEvent.start = activityDate;
                formattedEvent.end = activityDate;
                formattedEvent.allDay = true;
                formattedEvent.backgroundColor = "#4285F4";
                formattedEvent.color = "#4285F4";
                break;

              case "pomodoro":
                formattedEvent.start = event.start ? new Date(event.start) : new Date();
                formattedEvent.end = event.end ? new Date(event.end) : new Date(formattedEvent.start.getTime() + 25 * 60000);
                formattedEvent.backgroundColor = "#EA4335";
                formattedEvent.color = "#EA4335";
                break;

              case "event":
              default:
                formattedEvent.start = event.start ? new Date(event.start) : new Date();
                formattedEvent.end = event.end ? new Date(formattedEvent.start.getTime() + 3600000) : new Date(formattedEvent.start.getTime() + 3600000);
                formattedEvent.backgroundColor = "#3174ad";
                formattedEvent.color = "#3174ad";
                break;
            }

            return formattedEvent;
          });
          setEvents(formattedEvents);
        }
      })
      .catch((err) => console.error(err));
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'activity': return <Check className={styles.iconSizeSmall} />;
      case 'pomodoro': return <Timer className={styles.iconSizeSmall} />;
      default: return <Calendar className={styles.iconSizeSmall} />;
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventStartDate = event.start ? new Date(event.start) : null;
      if (event.extendedProps && event.extendedProps.recurrenceRule) {
        try {
          const rrule = RRule.fromString(event.extendedProps.recurrenceRule);
          const occurrences = rrule.between(
            new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
            new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
            true
          );
          return occurrences.length > 0;
        } catch (e) {
          console.error("Error parsing recurrence rule for filtering:", event.extendedProps.recurrenceRule, e);
          return false;
        }
      }
      return eventStartDate && eventStartDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForSelectedDate = () => {
    return getEventsForDate(selectedDate).sort((a, b) => new Date(a.start) - new Date(b.start));
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      const today = new Date();
      if (newDate.getMonth() === today.getMonth() && newDate.getFullYear() === today.getFullYear()) {
        setSelectedDate(today);
      } else {
        // Quando si naviga, imposta selectedDate al primo giorno del nuovo mese
        setSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Calcola l'offset per iniziare la settimana di lunedì
    // getDay() restituisce 0 per Domenica, 1 per Lunedì, ..., 6 per Sabato
    // Se il primo giorno del mese è Domenica (0), vogliamo sottrarre 6 giorni per arrivare a Lunedì.
    // Se è Lunedì (1), sottraiamo 0 giorni.
    // Se è Martedì (2), sottraiamo 1 giorno, e così via.
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Offset per Lunedì come primo giorno

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - offset);

    const days = [];
    for (let i = 0; i < 42; i++) { // 6 settimane * 7 giorni = 42 celle
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isSameMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date); // Update selectedDate when a day is clicked
  };

  const handleNewEventButtonClick = () => {
    setIsEditing(false);
    setNewEvent({ // Initialize with a fresh object, don't spread 'prev'
      id: uuidv4(),
      title: "", // Ensure title is empty
      type: "event", // Default type
      cyclesLeft: null,
      activityDate: new Date(selectedDate), // Set activityDate to selectedDate
      start: new Date(selectedDate), // Set start time to selectedDate
      end: new Date(new Date(selectedDate).getTime() + 60 * 60 * 1000), // Set end time 1 hour after start
      location: "",
      recurrenceRule: "",
      desc: "",
    });
    setShowModal(true);
  };


  const handleEventClick = (eventData) => {
    let recurrenceValue = "";
    if (eventData.extendedProps && eventData.extendedProps.recurrenceRule) {
      const freqMatch = eventData.extendedProps.recurrenceRule.match(/FREQ=([A-Z]+)/);
      if (freqMatch && freqMatch[1]) {
        recurrenceValue = freqMatch[1].toLowerCase();
      }
    }

    const start = eventData.start || new Date();
    const end = eventData.end || new Date(start.getTime() + 3600000);

    const eventForModal = {
      id: eventData.id,
      title: eventData.title || "",
      type: eventData.extendedProps.type || "event",
      location: eventData.extendedProps.location || "",
      recurrenceRule: recurrenceValue,
      desc: eventData.extendedProps.desc || "",
    };

    switch(eventForModal.type) {
      case "activity":
        eventForModal.activityDate = eventData.extendedProps.activityDate
          ? new Date(eventData.extendedProps.activityDate)
          : start;
        break;
      case "pomodoro":
        eventForModal.cyclesLeft = eventData.extendedProps.cyclesLeft || 0;
        eventForModal.start = start;
        eventForModal.end = end;
        break;
      case "event":
      default:
        eventForModal.start = start;
        eventForModal.end = end;
        break;
    }

    setIsEditing(true);
    setNewEvent(eventForModal);
    setShowModal(true);
  };


  const handleSaveEvent = () => {
    if (!newEvent.title && newEvent.type !== "pomodoro") return;

    const url = isEditing
      ? `http://localhost:5000/api/events/update/${newEvent.id}`
      : "http://localhost:5000/api/events/save";
    const method = isEditing ? "PUT" : "POST";

    let rruleString = null;
    if ((newEvent.type === "event" || newEvent.type === "activity") && newEvent.recurrenceRule) {
      try {
        const frequencyMap = {
          'daily': RRule.DAILY,
          'weekly': RRule.WEEKLY,
          'monthly': RRule.MONTHLY,
          'yearly': RRule.YEARLY
        };

        const freq = frequencyMap[newEvent.recurrenceRule];

        if (freq !== undefined) {
          const startDate = newEvent.type === "activity"
            ? (newEvent.activityDate || new Date())
            : (newEvent.start || new Date());

          const rruleObj = new RRule({
            freq: freq,
            dtstart: startDate
          });
          rruleString = rruleObj.toString();
        } else {
          console.error("Invalid recurrence rule value:", newEvent.recurrenceRule);
          alert("Invalid recurrence rule");
          return;
        }
      } catch (error) {
        console.error("Error creating rrule:", error);
        alert("Invalid recurrence rule");
        return;
      }
    }

    const eventData = {
      title: newEvent.title || (newEvent.type === "pomodoro" ? "Pomodoro Session" : ""),
      description: newEvent.desc || "",
      location: newEvent.location || "",
      type: newEvent.type,
    };

    switch(newEvent.type) {
      case "activity":
        eventData.activityDate = (newEvent.activityDate || new Date()).toISOString();
        eventData.recurrenceRule = rruleString;
        break;
      case "pomodoro":
        eventData.cyclesLeft = newEvent.cyclesLeft || 0;
        eventData.start = (newEvent.start || new Date()).toISOString();
        eventData.end = (newEvent.end || new Date(Date.now() + 25 * 60000)).toISOString();
        break;
      case "event":
      default:
        eventData.start = (newEvent.start || new Date()).toISOString();
        eventData.end = (newEvent.end || new Date(Date.now() + 3600000)).toISOString();
        eventData.recurrenceRule = rruleString;
        break;
    }

    if (isEditing) eventData._id = newEvent.id;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          fetchAllEvents();
          setShowModal(false);
          resetForm();
        } else {
          alert(json.message);
        }
      })
      .catch((err) => console.error("Error saving event:", err));
  };

  const handleDeleteEvent = () => {
    fetch(`http://localhost:5000/api/events/remove/${newEvent.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          fetchAllEvents();
          setShowModal(false);
          resetForm();
        } else {
          alert(json.message);
        }
      })
      .catch((err) => console.error("Error deleting event:", err));
  };

  const resetForm = () => {
    setNewEvent({
      id: "",
      title: "",
      type: "event",
      cyclesLeft: null,
      activityDate: null,
      start: new Date(),
      end: new Date(),
      location: "",
      recurrenceRule: "",
      desc: "",
    });
    setIsEditing(false);
  };


  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const dayLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']; // Etichette in italiano

    return (
      <div className={styles.monthViewContainer}>
        <div className={styles.monthViewDayLabelsGrid}>
          {dayLabels.map(day => (
            <div key={day} className={styles.monthViewDayLabel}>
              {day}
            </div>
          ))}
        </div>
        <div className={styles.monthViewDaysGrid}>
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const cellClasses = [
              styles.dayCell,
              styles.dayCellHover,
              isToday(day) ? styles.dayCellToday : '',
              isSelected(day) ? styles.dayCellSelected : '',
              !isSameMonth(day) ? styles.dayCellNotInMonth : ''
            ].join(' ').trim();

            const dateNumberClasses = [
                styles.dayCellDateNumber,
                isToday(day) ? styles.dayCellDateNumberToday : ''
            ].join(' ').trim();

            return (
              <div
                key={index}
                onClick={() => handleDateSelect(day)}
                className={cellClasses}
              >
                <div className={dateNumberClasses}>
                  {day.getDate()}
                </div>
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    // Removed onClick handler from here as per new requirement
                    className={styles.dayCellEvent}
                    style={{ backgroundColor: event.color + '20', color: event.color }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className={styles.dayCellMoreEvents}>
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerPadding}>
          {/* Month Navigation */}
          <div className={styles.monthNavigation}>
            <button
              onClick={() => navigateMonth(-1)}
              className={`${styles.iconButton} ${styles.iconButtonHover}`}
            >
              <ChevronLeft className={styles.iconSize} />
            </button>
            <h2 className={styles.monthNavTitle}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className={`${styles.iconButton} ${styles.iconButtonHover}`}
            >
              <ChevronRight className={styles.iconSize} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Events Summary for Selected Date */}
        <div className={styles.todaysEventsSummaryContainer}>
          <h3 className={styles.todaysEventsTitle}>
            {isToday(selectedDate) ? "Today" : formatDate(selectedDate)}
          </h3>
          <div className={styles.todaysEventsCard}>
            {getEventsForSelectedDate().length === 0 ? (
              <p className={styles.noEventsText}>No events scheduled</p>
            ) : (
              <div className="space-y-2">
                {getEventsForSelectedDate().slice(0, 5).map(event => ( // Show more events here
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)} // This is now the only place to click an event to edit it
                    className={styles.todayEventItem}
                  >
                    <div
                      className={styles.todayEventColorDot}
                      style={{ backgroundColor: event.color }}
                    />
                    <div className={styles.todayEventTextContainer}>
                      <p className={styles.todayEventTitleText}>{event.title}</p>
                      <p className={styles.todayEventTimeText}>
                        {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                      </p>
                    </div>
                    {event.extendedProps && event.extendedProps.location && (
                      <div className={`${styles.iconSizeSmall} ${styles.todayEventLocationIcon}`}><MapPin size={12} /></div>
                    )}
                  </div>
                ))}
                {getEventsForSelectedDate().length > 5 && (
                  <p className={styles.seeAllEventsText}>
                    +{getEventsForSelectedDate().length - 5} more
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Month View Content */}
        {renderMonthView()}
      </div>

      {/* Floating Action Button to Add Event */}
      <div className={styles.fabContainer}>
        <button
          onClick={handleNewEventButtonClick}
          className={`${styles.primaryButton} ${styles.fabButton}`}
        >
          <Plus className={styles.iconSize} />
        </button>
      </div>

      {/* Event Modal */}
      {showModal && (
        <EventModal
          showEventModal={showModal}
          setShowEventModal={setShowModal}
          selectedEvent={newEvent} // Pass newEvent as selectedEvent to the modal
          setSelectedEvent={setNewEvent} // Pass setNewEvent as setSelectedEvent
          isEditing={isEditing}
          handleSave={handleSaveEvent}
          handleDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default MobileCalendarApp;