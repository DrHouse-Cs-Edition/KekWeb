import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, X } from 'lucide-react';
import styles from './ListaEventiGiornalieri.module.css';

const ListaEventiGiornalieri = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    fetchTodaysEvents();
  }, []);

  const fetchTodaysEvents = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          // Filter for today's events and only event type
          const today = new Date();
          const todaysEvents = json.list.filter(event => {
            if (event.type !== 'event') return false;
            
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === today.toDateString();
          });
          
          setEvents(todaysEvents);
          setError(null);
        } else {
          setError('No events found');
        }
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeDisplay = (event) => {
    if (event.start && event.end) {
      return `${formatTime(event.start)} - ${formatTime(event.end)}`;
    }
    if (event.start) {
      return formatTime(event.start);
    }
    return 'All day';
  };

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
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Today's Events</h1>
        <p className={styles.date}>{formatDate(new Date())}</p>
      </div>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <Calendar className={styles.emptyIcon} />
          <p className={styles.emptyText}>No events scheduled for today</p>
          <p className={styles.emptySubtext}>Enjoy your free time!</p>
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

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Event Details</h2>
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
                    <span>Repeats: {selectedEvent.recurrenceRule}</span>
                  </div>
                )}
              </div>
              
              {selectedEvent.description && (
                <div className={styles.modalDescription}>
                  <h4 className={styles.modalDescriptionTitle}>Description</h4>
                  <p className={styles.modalDescriptionText}>
                    {selectedEvent.description}
                  </p>
                </div>
              )}
            </div>
            
            <div className={styles.modalFooter}>
              <button
                onClick={() => setSelectedEvent(null)}
                className={styles.cancelButton}
              >
                Close
              </button>
              <button className={styles.editButton}>
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaEventiGiornalieri;