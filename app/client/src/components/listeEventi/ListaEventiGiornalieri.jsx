import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, X } from 'lucide-react';
import styles from './ListaEventiGiornalieri.module.css';

const ListaEventiGiornalieri = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverDate, setServerDate] = useState(new Date());

  useEffect(() => {
    fetchServerDateAndEvents();
  }, []);

  const fetchServerDate = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/timeMachine/date", {
        method: "GET",
        credentials: "include",
      });
      const json = await response.json();
      if (json.success) {
        setServerDate(new Date(json.date));
        return new Date(json.date);
      }
    } catch (error) {
      console.error('Errore nel caricamento data server:', error);
    }
    return new Date();
  };

  const fetchServerDateAndEvents = async () => {
    setLoading(true);
    try {
      const currentServerDate = await fetchServerDate();
      
      const response = await fetch("http://localhost:5000/api/events/all", {
        method: "GET",
        credentials: "include",
      });
      const json = await response.json();
      
      if (json.success) {
        // Filtra solo gli eventi di oggi del tipo 'event'
        const todaysEvents = json.list.filter(event => {
          if (event.type !== 'event') return false;
          
          const eventDate = new Date(event.start);
          return eventDate.toDateString() === currentServerDate.toDateString();
        });
        
        setEvents(todaysEvents);
        setError(null);
      } else {
        setError('Nessun evento trovato');
      }
    } catch (err) {
      console.error('Errore nel caricamento eventi:', err);
      setError('Impossibile caricare gli eventi');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysEvents = () => {
    fetchServerDateAndEvents();
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determina la visualizzazione dell'orario per l'evento
  function getTimeDisplay(event) {
    if (event.start && event.end) {
      return `${formatTime(event.start)} - ${formatTime(event.end)}`;
    }
    if (event.start) {
      return formatTime(event.start);
    }
    return 'Tutto il giorno';
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingTitle}></div>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.loadingCard}>
              <div className={styles.loadingLine}></div>
              <div className={styles.loadingLineShort}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
          <button 
            onClick={fetchTodaysEvents}
            className={styles.retryButton}
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Eventi di Oggi</h1>
        <p className={styles.date}>{formatDate(serverDate)}</p>
      </div>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <Calendar className={styles.emptyIcon} />
          <p className={styles.emptyText}>Nessun evento programmato per oggi</p>
          <p className={styles.emptySubtext}>Goditi il tempo libero!</p>
        </div>
      ) : (
        <div className={styles.eventsList}>
          {events.map((event) => (
            <div
              key={event._id}
              onClick={() => setSelectedEvent(event)}
              className={styles.eventCard}
            >
              <div className={styles.eventContent}>
                <div className={styles.eventHeader}>
                  <Calendar className={styles.eventIcon} />
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                </div>
                
                <div className={styles.eventMeta}>
                  <div className={styles.timeInfo}>
                    <Clock className={styles.metaIcon} />
                    <span>{getTimeDisplay(event)}</span>
                  </div>
                  
                  {event.location && (
                    <div className={styles.locationInfo}>
                      <MapPin className={styles.metaIcon} />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
                
                {event.description && (
                  <p className={styles.eventDescription}>
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal dettagli evento */}
      {selectedEvent && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Dettagli Evento</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className={styles.closeButton}
              >
                <X className={styles.closeIcon} />
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.modalEventHeader}>
                <Calendar className={styles.modalEventIcon} />
                <h3 className={styles.modalEventTitle}>{selectedEvent.title}</h3>
              </div>
              
              <div className={styles.modalEventDetails}>
                <div className={styles.modalDetailItem}>
                  <Clock className={styles.modalDetailIcon} />
                  <span>{getTimeDisplay(selectedEvent)}</span>
                </div>
                
                {selectedEvent.location && (
                  <div className={styles.modalDetailItem}>
                    <MapPin className={styles.modalDetailIcon} />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                
                {selectedEvent.recurrenceRule && (
                  <div className={styles.modalDetailItem}>
                    <Calendar className={styles.modalDetailIcon} />
                    <span>Si ripete: {selectedEvent.recurrenceRule}</span>
                  </div>
                )}
              </div>
              
              {selectedEvent.description && (
                <div className={styles.modalDescription}>
                  <h4 className={styles.modalDescriptionTitle}>Descrizione</h4>
                  <p className={styles.modalDescriptionText}>
                    {selectedEvent.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaEventiGiornalieri;