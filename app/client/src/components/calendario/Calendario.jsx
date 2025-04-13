import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import itLocale from '@fullcalendar/core/locales/it'; // Import Italiano

import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import './Calendario.css';

export default function CalendarApp() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEvent, setNewEvent] = useState({
    id: '',
    title: '',
    start: new Date(),
    end: new Date(),
    location: '',
    recurrenceRule: '',
    desc: '',
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
          const formattedEvents = json.list.map(event => ({
            id: event._id,
            title: event.title,
            start: new Date(event.start),
            end: new Date(event.end),
            extendedProps: {
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
      location: clickInfo.event.extendedProps.location,
      recurrenceRule: clickInfo.event.extendedProps.recurrenceRule,
      desc: clickInfo.event.extendedProps.desc,
    });
    setShowModal(true);
  };

  const handleSaveEvent = () => {
    if (!newEvent.title) return;

    const url = isEditing 
      ? `http://localhost:5000/api/event/update/${newEvent.id}`
      : 'http://localhost:5000/api/events/save';
    const method = isEditing ? 'PUT' : 'POST';

    const eventData = {
      title: newEvent.title,
      description: newEvent.desc,
      location: newEvent.location,
      start: newEvent.start.toISOString(),
      end: newEvent.end.toISOString(),
      recurrenceRule: newEvent.recurrenceRule
    };

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
    fetch(`http://localhost:5000/api/event/remove/${newEvent.id}`, {
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
      id: '',
      title: '',
      start: new Date(),
      end: new Date(),
      location: '',
      recurrenceRule: '',
      desc: '',
    });
    setIsEditing(false);
  };

  return (
    <div className="calendar-container">
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
        locale={itLocale}
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Recurrence</label>
                <select
                  value={newEvent.recurrenceRule}
                  onChange={(e) => setNewEvent({ ...newEvent, recurrenceRule: e.target.value })}
                >
                  <option value="">No recurrence</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="datetime-local"
                  value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm", { locale: it })}
                  onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="datetime-local"
                  value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm", { locale: it })}
                  onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newEvent.desc}
                  onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              {isEditing && (
                <button className="delete-btn" onClick={handleDeleteEvent}>
                  Delete
                </button>
              )}
              <button className="cancel-btn" onClick={() => { setShowModal(false); resetForm(); }}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSaveEvent}>
                {isEditing ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}