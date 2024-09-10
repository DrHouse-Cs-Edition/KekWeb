import React from 'react';
import './Evento.css';

const Evento = ({ title }) => {
    return (
        <div className="event">
            {title}
        </div>
    );
};

export default Evento;