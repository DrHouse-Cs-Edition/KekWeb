import React from 'react';
import Style from "./Giorno.module.css";
import Evento from './Evento.jsx';

const Giorno = ({ date , selected, events, handleClick}) => {
    //let selectedDate = date;
    return (
        <div
        key={date.format('YYYY-MM-DD')}
        className={` ${Style.day} ${selected ? Style.selected : ''} `}
        onClick={() => handleClick(date)}
        >
            {date.date()}
            {events.map((event, index) => (
                <Evento key={index} title={event.title} />
            ))}
        </div>
    );
};

export default Giorno;