import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import './Calendario.css';
import Evento from './Evento.jsx';
import Giorno from './Giorno.jsx';

const daysOfWeek = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];

const Calendario = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [evento, setEvento] = useState({
    title: '',
    description: '',
    location: '',
    start: '',
    end: '',
    recurrenceRule: '',
    alarms: []
  });

  const startOfMonth = useMemo(() => currentDate.startOf('month'), [currentDate]);
  const endOfMonth = useMemo(() => currentDate.endOf('month'), [currentDate]);
  const startOfWeek = useMemo(() => startOfMonth.startOf('week'), [startOfMonth]);
  const endOfWeek = useMemo(() => endOfMonth.endOf('week'), [endOfMonth]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  }, [currentDate]);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(currentDate.add(1, 'month'));
  }, [currentDate]);

  const handleDateClick = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvento(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = useCallback((e) => {
    e.preventDefault();
    const { title, description, location, start, end, recurrenceRule, alarms } = evento;

    if (!title.trim()) {
      alert('Title is required!');
      return;
    }

    const startDate = dayjs(start);
    const endDate = dayjs(end);

    // Convert dates to [YYYY, MM, DD, HH, mm] arrays (ICalendar format)
    const startArray = [
      startDate.year(),
      startDate.month() + 1, // Convert back to 1-based month
      startDate.date(),
      startDate.hour(),
      startDate.minute()
    ];

    const endArray = [
      endDate.year(),
      endDate.month() + 1,
      endDate.date(),
      endDate.hour(),
      endDate.minute()
    ];

    // POST to backend
    fetch('http://localhost:5000/api/events/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        location,
        start: startArray,
        end: endArray,
        recurrenceRule,
        alarms
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEvents((prev) => [...prev, { ...data.event, id: data.id }]);
          setEvento({ title: '', description: '', location: '', start: '', end: '', recurrenceRule: '', alarms: [] });
          setSelectedDate(null);
          console.log('startArray:', startArray);
          console.log('endArray:', endArray);
        } else {
          alert(data.message);
        }
      })
      .catch((err) => alert('Failed to save event.'));
  }, [evento]);

  const handleDeleteEvent = useCallback((eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  }, [events]);

  const generateCalendar = useMemo(() => {
    const calendar = [];
    let date = startOfWeek;

    while (date.isBefore(endOfMonth, 'day') || date.isSame(endOfMonth, 'day')) {
      if (date.isBefore(startOfMonth, 'day'))
        calendar.push(<div key={date.toString()}></div>);
      else {
        const dayEvents = events.filter(event => dayjs(event.start).isSame(date, 'day'));
        calendar.push(
          <Giorno
            key={date.toString()}
            date={date}
            events={dayEvents}
            selected={date.isSame(selectedDate, 'day')}
            handleClick={handleDateClick}
            onDeleteEvent={handleDeleteEvent}>
          </Giorno>
        );
      }
      date = date.add(1, 'day');
    }

    return calendar;
  }, [startOfWeek, endOfMonth, startOfMonth, events, selectedDate, handleDateClick, handleDeleteEvent]);

  useEffect(() => {
    if (selectedDate) {
      const defaultStart = selectedDate.format('YYYY-MM-DDTHH:mm');
      const defaultEnd = selectedDate.add(1, 'hour').format('YYYY-MM-DDTHH:mm');
      setEvento(prev => ({
        ...prev,
        start: defaultStart,
        end: defaultEnd
      }));
    }
  }, [selectedDate]);

  useEffect(() => {
    fetch('http://localhost:5000/api/events/all')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          const parsedEvents = data.events.map(event => {
            // Convert start/end arrays to valid Day.js objects
            const parseDateArray = (arr) => {
              if (!arr || arr.length < 5) return dayjs(); // Fallback
              return dayjs(new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]));
            };
  
            return {
              ...event,
              start: parseDateArray(event.start),
              end: parseDateArray(event.end)
            };
          });
          setEvents(parsedEvents);
        } else {
          setEvents([]);
        }
      })
      .catch((err) => {
        console.error('Error loading events:', err);
        setEvents([]);
      });
  }, []);

  return (
    <div>
      <div>
        <button onClick={handlePrevMonth}>Previous</button>
        <span>{currentDate.format('MMMM YYYY')}</span>
        <button onClick={handleNextMonth}>Next</button>
      </div>

      <div className="calendar">
        {daysOfWeek.map((day) => (
          <div key={day} className="calendar-header">
            {day}
          </div>
        ))}
        {generateCalendar}
      </div>

      {selectedDate && (
        <form className="event-form" onSubmit={handleAddEvent}>
          <h3>Add Event for {selectedDate.format('MMMM DD, YYYY')}</h3>
          <input
            type="text"
            name="title"
            value={evento.title}
            onChange={handleChange}
            placeholder="Title"
            required
          />
          <input
            type="text"
            name="description"
            value={evento.description}
            onChange={handleChange}
            placeholder="Description"
          />
          <input
            type="text"
            name="location"
            value={evento.location}
            onChange={handleChange}
            placeholder="Location"
          />
          <label>
            Start:
            <input
              type="datetime-local"
              name="start"
              value={evento.start}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            End:
            <input
              type="datetime-local"
              name="end"
              value={evento.end}
              onChange={handleChange}
              required
            />
          </label>
          <input
            type="text"
            name="recurrenceRule"
            value={evento.recurrenceRule}
            onChange={handleChange}
            placeholder="Recurrence Rule (e.g., DAILY, WEEKLY)"
          />
          <button type="submit">Add Event</button>
        </form>
      )}
    </div>
  );
};

export default Calendario;