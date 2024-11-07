import React, { useState } from 'react';
import dayjs from 'dayjs';
import './Calendario.css';
import Evento from './Evento.jsx';

const daysOfWeek = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];

const Calendario = () => {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [eventTitle, setEventTitle] = useState('');

    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startOfWeek = startOfMonth.startOf('week'); // primo giorno settimana contenente il primo giorno del mese (NOTA: comincia dalla domenica)
    const endOfWeek = endOfMonth.endOf('week'); // ultimo giorno settimana contenente l'ultimo giorno del mese

    const handlePrevMonth = () => {
        setCurrentDate(currentDate.subtract(1, 'month'));
    };

    const handleNextMonth = () => {
        setCurrentDate(currentDate.add(1, 'month'));
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    const handleAddEvent = (e) => {
        e.preventDefault();
        if (eventTitle.trim() !== '') {
            setEvents([...events, { date: selectedDate, title: eventTitle }]);
            setEventTitle('');
        }
    };

    const generateCalendar = () => {
        const calendar = []; // calendario = unico array di "giorni" in html
        let date = startOfWeek;

        while (date.isBefore(endOfMonth, 'day') || date.isSame(endOfMonth, 'day') ) { // perché isBefore(endOfWeek) anziché (endOfMonth) ?
            const dayEvents = events.filter(event => dayjs(event.date).isSame(date, 'day')); // filter
            calendar.push(
                <div
                    key={date.format('YYYY-MM-DD')}
                    className={`calendar-day ${selectedDate && date.isSame(selectedDate, 'day') ? 'selected' : ''}`} // "selectedDate && ..." controlla che selectedDate sia definito && ...
                    onClick={() => handleDateClick(date)}
                >
                    {date.date()}
                    {dayEvents.map((event, index) => (
                        <Evento key={index} title={event.title} />
                    ))}
                </div>
            );
            date = date.add(1, 'day');
        }

        return calendar;
    };

    return (
        <div>
            <div>
                <button onClick={handlePrevMonth}>Previous</button>
                <span>{currentDate.format('MMMM YYYY')}</span>
                <button onClick={handleNextMonth}>Next</button>
            </div>

            <div className="calendar">
                {daysOfWeek.map((day) => ( // scrive i giorni della settimana (lun,mar,mer,...)
                    <div key={day} className="calendar-header">
                        {day}
                    </div>
                ))}
                {generateCalendar()}
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