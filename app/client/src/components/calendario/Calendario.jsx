import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns';import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { v4 as uuidv4 } from 'uuid';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendario.css';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: date => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

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
    desc: '', // Maps to 'description' in backend
  });

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = () => {
    fetch('http://localhost:5000/api/events/all')
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          const formattedEvents = json.list.map(event => ({
            id: event._id, // MongoDB uses _id
            title: event.title,
            start: new Date(event.start),
            end: new Date(event.end),
            location: event.location,
            recurrenceRule: event.recurrenceRule,
            desc: event.description, // Map backend 'description' to frontend 'desc'
          }));
          setEvents(formattedEvents);
        }
      })
      .catch(err => console.error(err));
  };

  const handleSelectSlot = ({ start, end }) => {
    setIsEditing(false);
    setNewEvent(prev => ({
      ...prev,
      id: uuidv4(),
      start,
      end
    }));
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setIsEditing(true);
    setNewEvent(event);
    setShowModal(true);
  };

  const handleSaveEvent = () => {
    if (!newEvent.title) return;

    const url = isEditing 
      ? `http://localhost:5000/api/event/update/${newEvent.id}`
      : 'http://localhost:5000/api/events/save';
    const method = isEditing ? 'PUT' : 'POST';

    // Convert to backend-compatible format
    const eventData = {
      title: newEvent.title,
      description: newEvent.desc,
      location: newEvent.location,
      start: newEvent.start.toISOString(),
      end: newEvent.end.toISOString(),
      recurrenceRule: newEvent.recurrenceRule
    };

    // For updates, include ID in body
    if (isEditing) eventData._id = newEvent.id;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
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
      method: 'DELETE'
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

  const eventPropGetter = () => ({
    style: {
      backgroundColor: '#3174ad',
      color: 'white',
      borderRadius: '4px',
      padding: '2px 5px',
      cursor: 'pointer',
    },
  });

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        className="calendar"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
        slotProps={{
          timeSlotWrapper: {
            style: {
              minHeight: '60px',
            },
          },
        }}
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
                  value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="datetime-local"
                  value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
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