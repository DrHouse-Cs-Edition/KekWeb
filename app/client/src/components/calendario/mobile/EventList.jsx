import React from 'react';
import { MapPin } from 'lucide-react';
import styles from './EventList.module.css';

const EventList = ({ 
  events, 
  selectedDate, 
  serverDate, 
  onEventClick, 
  title,
  maxEvents = 5 
}) => {
  // Formatta l'orario per la visualizzazione
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatta la data per il titolo
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Controlla se la data è oggi
  const isToday = (date) => {
    return date.toDateString() === serverDate.toDateString();
  };

  // Ordina gli eventi per orario
  const sortedEvents = events.sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className={styles.eventListContainer}>
      <h3 className={styles.eventListTitle}>
        {title || (isToday(selectedDate) ? "Oggi" : formatDate(selectedDate))}
      </h3>
      
      <div className={styles.eventListCard}>
        {sortedEvents.length === 0 ? (
          <p className={styles.noEventsText}>Nessun evento programmato</p>
        ) : (
          <div className={styles.eventsContainer}>
            {sortedEvents.slice(0, maxEvents).map(event => ( 
              <div
                key={event.id}
                onClick={() => onEventClick(event)} 
                className={styles.eventItem}
              >
                <div
                  className={styles.eventColorDot}
                  style={{ backgroundColor: event.color }}
                />
                
                <div className={styles.eventTextContainer}>
                  <p className={styles.eventTitleText}>{event.title}</p>
                  <p className={styles.eventTimeText}>
                    {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                  </p>
                </div>
                
                {event.extendedProps && event.extendedProps.location && (
                  <div className={styles.eventLocationIcon}>
                    <MapPin size={12} />
                  </div>
                )}
              </div>
            ))}
            
            {sortedEvents.length > maxEvents && (
              <p className={styles.moreEventsText}>
                +{sortedEvents.length - maxEvents} altri
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;