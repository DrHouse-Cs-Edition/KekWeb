import React from 'react';
import Style from "./Giorno.module.css";
import Evento from './Evento.jsx';

const Giorno = ({ date, selected, events, handleClick, onDeleteEvent }) => {
    return (
        <div
            key={date.format('YYYY-MM-DD')}
            className={`${Style.day} ${selected ? Style.selected : ''}`}
            onClick={() => handleClick(date)}
        >
            {date.date()}
            <div className={Style.events}>
                {events.map((event, index) => (
                    <Evento 
                        key={event.id || index} 
                        title={event.title} 
                        onDelete={() => onDeleteEvent(event.id)} 
                    />
                ))}
            </div>
        </div>
    );
};

export default Giorno;
