import React from 'react';
import Style from './Evento.module.css';
import dayjs from 'dayjs';

const Evento = ({ title, description, location, start, end, recurrenceRule, alarms, onDelete }) => {
  const formatDateTime = (date) => {
    if (!date || !date.isValid()) return 'N/A';
    return date.format('MMM D, YYYY h:mm A');
  };

  return (
    <div className={Style.event}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {location && <p>📍 {location}</p>}
      <p>🕒 Start: {formatDateTime(start)}</p>
      <p>🏁 End: {formatDateTime(end)}</p>
      {recurrenceRule && <p>🔁 Repeats: {recurrenceRule}</p>}
      {alarms?.length > 0 && (
        <div className={Style.alarms}>
          🔔 Alarms:
          {alarms.map((alarm, index) => (
            <div key={index}>
              {/* Access alarm as an array, not an object */}
              {alarm[0]} - {alarm[1]} minutes before - {alarm[2]}
            </div>
          ))}
        </div>
      )}
      <button
        className={Style.deleteButton}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        &times;
      </button>
    </div>
  );
};

export default Evento;