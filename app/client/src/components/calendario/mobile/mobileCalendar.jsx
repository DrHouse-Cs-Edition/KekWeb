import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Timer, Check,} from 'lucide-react';
import { v4 as uuidv4 } from "uuid";
import { RRule } from "rrule";
import EventModal from './EventModal';
import styles from './mobileCalendar.module.css';

const MobileCalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // La data di cui vedo gli eventi
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEvent, setNewEvent] = useState({
    id: "",
    title: "",
    type: "event",
    cyclesLeft: null,
    activityDate: null,
    start: new Date(),
    end: new Date(),
    location: "",
    recurrenceRule: "",
    description: "", // Cambiato da desc a description
  });

  // Carico tutti gli eventi quando parte l'app
  useEffect(() => {
    loadAllEvents();
  }, []);

  // Funzione per caricare tutti gli eventi dal backend
  const loadAllEvents = () => {
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Trasformo gli eventi dal backend per il calendario mobile
          const eventsForMobile = data.list.map((event) => {
            let eventObj = {
              id: event._id,
              title: event.title,
              extendedProps: {
                type: event.type,
                cyclesLeft: event.cyclesLeft,
                location: event.location,
                recurrenceRule: event.recurrenceRule,
                description: event.description, // Cambiato da desc a description
                activityDate: event.activityDate ? new Date(event.activityDate) : null,
              },
            };

            // Gestisco i diversi tipi di eventi
            if (event.type === "activity") {
              let actDate = event.activityDate ? new Date(event.activityDate) : new Date();
              eventObj.start = actDate;
              eventObj.end = actDate;
              eventObj.allDay = true;
              eventObj.backgroundColor = "#4285F4";
              eventObj.color = "#4285F4";
            } else if (event.type === "pomodoro") {
              eventObj.start = event.start ? new Date(event.start) : new Date();
              eventObj.end = event.end ? new Date(event.end) : new Date(eventObj.start.getTime() + 25 * 60000);
              eventObj.backgroundColor = "#EA4335";
              eventObj.color = "#EA4335";
            } else {
              // Eventi normali
              eventObj.start = event.start ? new Date(event.start) : new Date();
              eventObj.end = event.end ? new Date(eventObj.start.getTime() + 3600000) : new Date(eventObj.start.getTime() + 3600000);
              eventObj.backgroundColor = "#3174ad";
              eventObj.color = "#3174ad";
            }

            return eventObj;
          });
          setEvents(eventsForMobile);
        }
      })
      .catch((err) => console.error("Errore nel caricamento eventi:", err));
  };

  // Funzione per ottenere l'icona giusta per ogni tipo di evento
  const getEventIcon = (type) => {
    if (type === 'activity') return <Check className={styles.iconSizeSmall} />;
    if (type === 'pomodoro') return <Timer className={styles.iconSizeSmall} />;
    return <Calendar className={styles.iconSizeSmall} />;
  };

  // Formatto l'ora in modo carino
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Formatto la data per il titolo
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Prendo tutti gli eventi per una data specifica
  const getEventsForDate = (date) => {
    return events.filter(event => {
      let eventDate = event.start ? new Date(event.start) : null;
      
      // Se ha ricorrenza, controllo se ricorre in questa data
      if (event.extendedProps && event.extendedProps.recurrenceRule) {
        try {
          let rrule = RRule.fromString(event.extendedProps.recurrenceRule);
          let startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
          let endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
          let occurrences = rrule.between(startOfDay, endOfDay, true);
          return occurrences.length > 0;
        } catch (e) {
          console.error("Errore nel parsing ricorrenza:", event.extendedProps.recurrenceRule, e);
          return false;
        }
      }
      
      // Altrimenti controllo se è nella stessa data
      return eventDate && eventDate.toDateString() === date.toDateString();
    });
  };

  // Prendo gli eventi del giorno selezionato e li ordino
  const getEventsForSelectedDate = () => {
    return getEventsForDate(selectedDate).sort((a, b) => new Date(a.start) - new Date(b.start));
  };

  // Navigo tra i mesi
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      let newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      let today = new Date();
      
      // Se torno al mese corrente, seleziono oggi
      if (newDate.getMonth() === today.getMonth() && newDate.getFullYear() === today.getFullYear()) {
        setSelectedDate(today);
      } else {
        // Altrimenti seleziono il primo del mese
        setSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      }
      return newDate;
    });
  };

  // Calcolo tutti i giorni da mostrare nel calendario (6 settimane)
  const getDaysInMonth = (date) => {
    let year = date.getFullYear();
    let month = date.getMonth();
    let firstDay = new Date(year, month, 1);
    
    // Calcolo da quale lunedì iniziare (perché voglio che la settimana inizi di lunedì)
    let dayOfWeek = firstDay.getDay(); // 0 = domenica, 1 = lunedì, ecc.
    let offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Se è domenica, torno indietro di 6

    let startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - offset);

    let days = [];
    for (let i = 0; i < 42; i++) { // 6 settimane x 7 giorni = 42 celle
      let day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Controllo se una data è oggi
  const isToday = (date) => {
    let today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Controllo se una data è quella selezionata
  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Controllo se una data è nello stesso mese che sto visualizzando
  const isSameMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Quando clicco su una data
  const handleDateSelect = (date) => {
    setSelectedDate(date); // Aggiorno la data selezionata
  };

  // Quando clicco sul pulsante + per aggiungere un evento
  const handleNewEventButtonClick = () => {
    setIsEditing(false);
    setNewEvent({ 
      id: uuidv4(),
      title: "", 
      type: "event", 
      cyclesLeft: null,
      activityDate: new Date(selectedDate), 
      start: new Date(selectedDate), 
      end: new Date(new Date(selectedDate).getTime() + 60 * 60 * 1000),
      location: "",
      recurrenceRule: "",
      description: "", // Cambiato da desc a description
    });
    setShowModal(true);
  };

  // Quando clicco su un evento per modificarlo
  const handleEventClick = (eventData) => {
    // Estraggo la ricorrenza se c'è
    let recurrenceValue = "";
    if (eventData.extendedProps && eventData.extendedProps.recurrenceRule) {
      let freqMatch = eventData.extendedProps.recurrenceRule.match(/FREQ=([A-Z]+)/);
      if (freqMatch && freqMatch[1]) {
        recurrenceValue = freqMatch[1].toLowerCase();
      }
    }

    let start = eventData.start || new Date();
    let end = eventData.end || new Date(start.getTime() + 3600000);

    let eventForModal = {
      id: eventData.id,
      title: eventData.title || "",
      type: eventData.extendedProps.type || "event",
      location: eventData.extendedProps.location || "",
      recurrenceRule: recurrenceValue,
      description: eventData.extendedProps.description || "", // Cambiato da desc a description
    };

    // Aggiungo le proprietà specifiche per tipo
    if (eventForModal.type === "activity") {
      eventForModal.activityDate = eventData.extendedProps.activityDate
        ? new Date(eventData.extendedProps.activityDate)
        : start;
    } else if (eventForModal.type === "pomodoro") {
      eventForModal.cyclesLeft = eventData.extendedProps.cyclesLeft || 0;
      eventForModal.start = start;
      eventForModal.end = end;
    } else {
      eventForModal.start = start;
      eventForModal.end = end;
    }

    setIsEditing(true);
    setNewEvent(eventForModal);
    setShowModal(true);
  };

  // Salvo l'evento (nuovo o modificato)
  const handleSaveEvent = () => {
    // Controllo che ci sia un titolo (tranne per i pomodoro)
    if (!newEvent.title && newEvent.type !== "pomodoro") {
      alert("Inserisci un titolo!");
      return;
    }

    let url = isEditing
      ? `http://localhost:5000/api/events/update/${newEvent.id}`
      : "http://localhost:5000/api/events/save";
    let method = isEditing ? "PUT" : "POST";

    // Gestisco la ricorrenza se è stata impostata
    let rruleString = null;
    if ((newEvent.type === "event" || newEvent.type === "activity") && newEvent.recurrenceRule) {
      try {
        let frequencyMap = {
          'daily': RRule.DAILY,
          'weekly': RRule.WEEKLY,
          'monthly': RRule.MONTHLY,
          'yearly': RRule.YEARLY
        };

        let freq = frequencyMap[newEvent.recurrenceRule];

        if (freq !== undefined) {
          let startDate = newEvent.type === "activity"
            ? (newEvent.activityDate || new Date())
            : (newEvent.start || new Date());

          let rruleObj = new RRule({
            freq: freq,
            dtstart: startDate
          });
          rruleString = rruleObj.toString();
          console.log("RRule creata:", rruleString);
        } else {
          console.error("Valore ricorrenza non valido:", newEvent.recurrenceRule);
          alert("Ricorrenza non valida");
          return;
        }
      } catch (error) {
        console.error("Errore creazione rrule:", error);
        alert("Errore nella ricorrenza");
        return;
      }
    }

    // Preparo i dati per il backend
    let eventData = {
      title: newEvent.title || (newEvent.type === "pomodoro" ? "Sessione Pomodoro" : ""),
      description: newEvent.description || "", // Cambiato da newEvent.desc a newEvent.description
      location: newEvent.location || "",
      type: newEvent.type,
    };

    // Aggiungo dati specifici per tipo
    if (newEvent.type === "activity") {
      eventData.activityDate = (newEvent.activityDate || new Date()).toISOString();
      eventData.recurrenceRule = rruleString;
    } else if (newEvent.type === "pomodoro") {
      eventData.cyclesLeft = newEvent.cyclesLeft || 0;
      eventData.start = (newEvent.start || new Date()).toISOString();
      eventData.end = (newEvent.end || new Date(Date.now() + 25 * 60000)).toISOString();
    } else {
      eventData.start = (newEvent.start || new Date()).toISOString();
      eventData.end = (newEvent.end || new Date(Date.now() + 3600000)).toISOString();
      eventData.recurrenceRule = rruleString;
    }

    if (isEditing) eventData._id = newEvent.id;

    console.log("Invio al backend:", eventData);

    // Invio al backend
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadAllEvents(); // Ricarico tutti gli eventi
          setShowModal(false);
          resetForm();
        } else {
          alert(data.message);
        }
      })
      .catch((err) => console.error("Errore nel salvataggio:", err));
  };

  // Elimino un evento
  const handleDeleteEvent = () => {
    if (!window.confirm("Sei sicuro di voler eliminare questo evento?")) return;
    
    fetch(`http://localhost:5000/api/events/remove/${newEvent.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadAllEvents();
          setShowModal(false);
          resetForm();
        } else {
          alert(data.message);
        }
      })
      .catch((err) => console.error("Errore eliminazione:", err));
  };

  // Resetto il form
  const resetForm = () => {
    setNewEvent({
      id: "",
      title: "",
      type: "event",
      cyclesLeft: null,
      activityDate: null,
      start: new Date(),
      end: new Date(),
      location: "",
      recurrenceRule: "",
      description: "", // Cambiato da desc a description
    });
    setIsEditing(false);
  };

  // Renderizzo la vista del mese
  const renderMonthView = () => {
    let days = getDaysInMonth(currentDate);
    let dayLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']; 

    return (
      <div className={styles.monthViewContainer}>
        <div className={styles.monthViewDayLabelsGrid}>
          {dayLabels.map(day => (
            <div key={day} className={styles.monthViewDayLabel}>
              {day}
            </div>
          ))}
        </div>
        <div className={styles.monthViewDaysGrid}>
          {days.map((day, index) => {
            let dayEvents = getEventsForDate(day);
            let cellClasses = [
              styles.dayCell,
              styles.dayCellHover,
              isToday(day) ? styles.dayCellToday : '',
              isSelected(day) ? styles.dayCellSelected : '',
              !isSameMonth(day) ? styles.dayCellNotInMonth : ''
            ].join(' ').trim();

            let dateNumberClasses = [
                styles.dayCellDateNumber,
                isToday(day) ? styles.dayCellDateNumberToday : ''
            ].join(' ').trim();

            return (
              <div
                key={index}
                onClick={() => handleDateSelect(day)}
                className={cellClasses}
              >
                <div className={dateNumberClasses}>
                  {day.getDate()}
                </div>
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={styles.dayCellEvent}
                    style={{ backgroundColor: event.color + '20', color: event.color }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className={styles.dayCellMoreEvents}>
                    +{dayEvents.length - 2} altri
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerPadding}>
          {/* Navigazione mese */}
          <div className={styles.monthNavigation}>
            <button
              onClick={() => navigateMonth(-1)}
              className={`${styles.iconButton} ${styles.iconButtonHover}`}
            >
              <ChevronLeft className={styles.iconSize} />
            </button>
            <h2 className={styles.monthNavTitle}>
              {currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className={`${styles.iconButton} ${styles.iconButtonHover}`}
            >
              <ChevronRight className={styles.iconSize} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className={styles.mainContent}>
        {/* Riassunto eventi per la data selezionata */}
        <div className={styles.todaysEventsSummaryContainer}>
          <h3 className={styles.todaysEventsTitle}>
            {isToday(selectedDate) ? "Oggi" : formatDate(selectedDate)}
          </h3>
          <div className={styles.todaysEventsCard}>
            {getEventsForSelectedDate().length === 0 ? (
              <p className={styles.noEventsText}>Nessun evento programmato</p>
            ) : (
              <div className="space-y-2">
                {getEventsForSelectedDate().slice(0, 5).map(event => ( 
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)} 
                    className={styles.todayEventItem}
                  >
                    <div
                      className={styles.todayEventColorDot}
                      style={{ backgroundColor: event.color }}
                    />
                    <div className={styles.todayEventTextContainer}>
                      <p className={styles.todayEventTitleText}>{event.title}</p>
                      <p className={styles.todayEventTimeText}>
                        {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                      </p>
                    </div>
                    {event.extendedProps && event.extendedProps.location && (
                      <div className={`${styles.iconSizeSmall} ${styles.todayEventLocationIcon}`}>
                        <MapPin size={12} />
                      </div>
                    )}
                  </div>
                ))}
                {getEventsForSelectedDate().length > 5 && (
                  <p className={styles.seeAllEventsText}>
                    +{getEventsForSelectedDate().length - 5} altri
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Vista mese */}
        {renderMonthView()}
      </div>

      {/* Bottone per aggiungere evento */}
      <div className={styles.fabContainer}>
        <button
          onClick={handleNewEventButtonClick}
          className={`${styles.primaryButton} ${styles.fabButton}`}
        >
          <Plus className={styles.iconSize} />
        </button>
      </div>

      {/* Modal evento */}
      {showModal && (
        <EventModal
          showEventModal={showModal}
          setShowEventModal={setShowModal}
          selectedEvent={newEvent} 
          setSelectedEvent={setNewEvent} 
          isEditing={isEditing}
          handleSave={handleSaveEvent}
          handleDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default MobileCalendarApp;