import React, { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import './Calendario.css';
import Evento from './Evento.jsx';
import Giorno from './Giorno.jsx';

const daysOfWeek = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];

const Calendario = () => {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [eventTitle, setEventTitle] = useState('');

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

    const handleAddEvent = useCallback((e) => {
        e.preventDefault();
        if (eventTitle.trim() !== '') {
            setEvents([...events, { date: selectedDate, title: eventTitle }]);
            setEventTitle('');
        }
    }, [eventTitle, events, selectedDate]);

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
                const dayEvents = events.filter(event => dayjs(event.date).isSame(date, 'day'));
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
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="Event Title"
                    />
                    <button type="submit">Add Event</button>
                </form>
            )}
        </div>
    );
};

export default Calendario;