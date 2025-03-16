import React from 'react';
import Style from './Giorno.module.css';
import Evento from './Evento.jsx';
import dayjs from 'dayjs';

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
            description={event.description}
            location={event.location}
            start={event.start}
            end={event.end}
            onDelete={() => onDeleteEvent(event.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Giorno;