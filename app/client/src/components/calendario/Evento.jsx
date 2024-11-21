import React from 'react';
import Style from './Evento.module.css';

const Evento = ({ title, onDelete }) => {
    return (
        <div className={Style.event}>
            <span>{title}</span>
            <button 
                className={Style.deleteButton} 
                onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the day click
                    onDelete();
                }}
            >
                &times;
            </button>
        </div>
    );
};

export default Evento;
