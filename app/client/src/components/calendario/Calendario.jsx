import React, { useState } from 'react';
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
        setSelectedDate(date); // giorno selezionato = giorno su cui hai cliccato
    };

    const handleAddEvent = (e) => {
        e.preventDefault();
        if (eventTitle.trim() !== '') {
            setEvents([...events, { date: selectedDate, title: eventTitle }]);
            setEventTitle('');
        }
    };

    const generateCalendar = () => {
        const calendar = []; // calendario = unico array di "giorni" (componenti)
        let date = startOfWeek;

        while (date.isBefore(endOfMonth, 'day') || date.isSame(endOfMonth, 'day') ) { // isBefore(endOfWeek) mostra invece pezzo settimana prossimo mese
            if(date.isBefore(startOfMonth, 'day')) // facoltativo per eliminare giorni mese precedente
                calendar.push(<div></div>);
            else{
                const dayEvents = events.filter(event => dayjs(event.date).isSame(date, 'day')); // filtra quelli che accadono nel giorno date
                calendar.push(
                    <Giorno date = {date} events={dayEvents} selected={date.isSame(selectedDate, 'day')} handleClick={handleDateClick}>
                    </Giorno>
                );
            }
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
                {generateCalendar() /*inserisce array di "giorni" html*/}
            </div>
            
            {selectedDate && ( // se selectedDate non è null allora carica html
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