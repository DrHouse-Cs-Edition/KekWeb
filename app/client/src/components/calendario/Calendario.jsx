import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import itLocale from '@fullcalendar/core/locales/it';
import CalendarView from './CalendarView';
import EventModal from './EventModal';
import './Calendario.css';

export default function CalendarApp() {
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
    fetch('http://localhost:5000/api/events/all', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          const formattedEvents = json.list.map((event) => ({
            id: event._id,
            title: event.title,
            start: event.type === "activity" ? new Date(event.activityDate) : new Date(event.start),
            end: event.type === "activity" ? new Date(event.activityDate) : new Date(event.end),
            extendedProps: {
              type: event.type,
              cyclesLeft: event.cyclesLeft,
              activityDate: event.activityDate,
              location: event.location,
              recurrenceRule: event.recurrenceRule,
              desc: event.description,
            },
          }));
          setEvents(formattedEvents);
        }
      })
      .catch(err => console.error(err));
  };

  const handleDateSelect = (selectInfo) => {
    setIsEditing(false);
    setNewEvent(prev => ({
      ...prev,
      id: uuidv4(),
      start: selectInfo.start,
      end: selectInfo.end
    }));
    setShowModal(true);
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = (clickInfo) => {
    setIsEditing(true);
    setNewEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      type: clickInfo.event.extendedProps.type ,
      cyclesLeft: clickInfo.event.extendedProps.cyclesLeft,
      activityDate: clickInfo.event.extendedProps.activityDate,
      location: clickInfo.event.extendedProps.location,
      recurrenceRule: clickInfo.event.extendedProps.recurrenceRule,
      desc: clickInfo.event.extendedProps.desc,
    });
    setShowModal(true);
  };

  const handleSaveEvent = () => {
    if (!newEvent.title) return;

    const url = isEditing 
      ? `http://localhost:5000/api/events/update/${newEvent.id}`
      : 'http://localhost:5000/api/events/save';
    const method = isEditing ? 'PUT' : 'POST';

    const eventData = {
      title: newEvent.title,
      description: newEvent.desc,
      location: newEvent.location,
      type: newEvent.type,
      cyclesLeft: newEvent.type === 'pomodoro' ? newEvent.cyclesLeft : undefined,
      activityDate: newEvent.type === 'activity' ? newEvent.activityDate?.toISOString() : undefined,
      start: newEvent.type === 'event' ? newEvent.start.toISOString() : undefined,
      end: newEvent.type === 'event' ? newEvent.end.toISOString() : undefined,
      recurrenceRule: newEvent.recurrenceRule,
      user: newEvent.user
    };
    console.log("Event Data Sent to Backend:", eventData); // Debugging

    if (isEditing) eventData._id = newEvent.id;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
      credentials: 'include',
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          fetchAllEvents();
          setShowModal(false);
          resetForm();
        } else {
          alert(json.message);
        }
      })
      .catch(err => console.error('Error saving event:', err));
  };

  const handleDeleteEvent = () => {
    fetch(`http://localhost:5000/api/events/remove/${newEvent.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          fetchAllEvents();
          setShowModal(false);
          resetForm();
        } else {
          alert(json.message);
        }
      })
      .catch(err => console.error('Error deleting event:', err));
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

  return (
    <div className="calendar-container">
      <CalendarView
        events={events}
        handleDateSelect={handleDateSelect}
        handleEventClick={handleEventClick}
        locale={itLocale}
      />

      {showModal && (
        <EventModal
          isEditing={isEditing}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          handleSaveEvent={handleSaveEvent}
          handleDeleteEvent={handleDeleteEvent}
          setShowModal={setShowModal}
          resetForm={resetForm}
        />
      )}
    </div>
  );
}