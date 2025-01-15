import React from 'react';
import Style from './Evento.module.css';

const Evento = ({ title, onDelete }) => {
    return (
        <div className={Style.event}>
            <h1>{title}</h1>
            <p>start:</p>
            <p>end:</p>
            <button 
                className={Style.deleteButton}
                onClick={(e) => {
                    e.stopPropagation(); // evita che il click attivi anche l'elemento padre (che contiene Evento)
                    onDelete();
                }}
            >
                &times;
            </button>
        </div>
    );
};

export default Evento;
