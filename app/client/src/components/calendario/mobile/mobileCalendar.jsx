import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Timer, Check } from 'lucide-react';
import { v4 as uuidv4 } from "uuid";
import { RRule } from "rrule";
import EventModal from './EventModal';
import styles from './mobileCalendar.module.css';

const MobileCalendarApp = () => {
  // Stati del componente
  const [currentDate, setCurrentDate] = useState(new Date()); // Il mese che sto vedendo
  const [selectedDate, setSelectedDate] = useState(new Date()); // La data di cui vedo gli eventi
  const [serverDate, setServerDate] = useState(new Date()); // Add server date state
  const [events, setEvents] = useState([]); // Tutti gli eventi
  const [showModal, setShowModal] = useState(false); // Se mostro il modal o no
  const [isEditing, setIsEditing] = useState(false); // Se sto modificando o creando
  const [newEvent, setNewEvent] = useState({
    id: "",
    title: "",
    type: "event",
    pomodoro: {
      _id: "",
      title: "",
      studyTime: null,
      breakTime: null,
      cycles: null,
    },   
    activityDate: null,
    start: new Date(),
    end: new Date(),
    location: "",
    recurrenceRule: "",
    description: "",
    alarm: {
      earlyness: 15,
      repeat_times: 1,
      repeat_every: 0
    }
  }); // I dati dell'evento che sto creando/modificando

  // Function to get server date from time machine API
  const fetchServerDate = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/timeMachine/date", {
        method: "GET",
        credentials: "include",
      });
      const json = await response.json();
      if (json.success) {
        const currentServerDate = new Date(json.date);
        setServerDate(currentServerDate);
        setCurrentDate(currentServerDate); // Set current month view to server date
        setSelectedDate(currentServerDate); // Set selected date to server date
        return currentServerDate;
      }
    } catch (error) {
      console.error('Error fetching server date:', error);
    }
    return new Date(); // Fallback to local date
  };

  // Load server date and events when component mounts
  useEffect(() => {
    const initializeCalendar = async () => {
      await fetchServerDate();
      loadAllEvents();
    };
    initializeCalendar();
  }, []);

  // Quando il componente si carica, prendo tutti gli eventi
  // Funzione per caricare tutti gli eventi dal server
  const loadAllEvents = () => {
    console.log("Carico tutti gli eventi dal server...");
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include", // Per i cookie di autenticazione
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Eventi ricevuti dal server:", data.list.length);
          
          // Trasformo gli eventi per il calendario mobile
          let eventsForMobile = data.list.map((event) => {
            console.log("Elaboro evento:", event.title, "tipo:", event.type);
            
            let eventObj = {
              id: event._id,
              title: event.title,
              extendedProps: {
                type: event.type,
                pomodoro: event.pomodoro,
                location: event.location,
                recurrenceRule: event.recurrenceRule,
                description: event.description,
                activityDate: event.activityDate ? new Date(event.activityDate) : null,
                alarm: event.alarm || {
                  earlyness: 15,
                  repeat_times: 1,
                  repeat_every: 0
                }
              },
            };

            // A seconda del tipo di evento cambio colore e durata
            if (event.type === "activity") {
              // Le attività durano tutto il giorno e sono blu
              let actDate = event.activityDate ? new Date(event.activityDate) : serverDate;
              eventObj.start = actDate;
              eventObj.end = actDate;
              eventObj.allDay = true;
              eventObj.backgroundColor = "#4285F4";
              eventObj.color = "#4285F4";
              console.log("Attività creata per il", actDate.toDateString());
            } else if (event.type === "pomodoro") {
              // I pomodoro durano 25 minuti e sono rossi
              eventObj.start = event.start ? new Date(event.start) : serverDate;
              eventObj.end = event.end ? new Date(event.end) : new Date(eventObj.start.getTime() + 25 * 60000);
              eventObj.backgroundColor = "#EA4335";
              eventObj.color = "#EA4335";
              console.log("Pomodoro creato:", eventObj.start, "-", eventObj.end);
            } else {
              // Gli eventi normali hanno durata personalizzata e sono blu scuri
              eventObj.start = event.start ? new Date(event.start) : serverDate;
              eventObj.end = event.end ? new Date(event.end) : new Date(eventObj.start.getTime() + 3600000); // Default 1 ora
              eventObj.backgroundColor = "#3174ad";
              eventObj.color = "#3174ad";
              console.log("Evento normale creato:", eventObj.start, "-", eventObj.end);
            }

            return eventObj;
          });
          
          setEvents(eventsForMobile);
          console.log("Eventi pronti per il calendario:", eventsForMobile.length);
        } else {
          console.log("Nessun evento trovato");
        }
      })
      .catch((err) => {
        console.error("Errore nel caricamento eventi:", err);
        alert("Errore nel caricamento degli eventi");
      });
  };

  // Funzione per prendere l'icona giusta per ogni tipo di evento
  const getEventIcon = (type) => {
    if (type === 'activity') return <Check className={styles.iconSizeSmall} />;
    if (type === 'pomodoro') return <Timer className={styles.iconSizeSmall} />;
    return <Calendar className={styles.iconSizeSmall} />;
  };

  // Formatto l'orario in modo carino (tipo 3:30 PM)
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Formatto la data per il titolo (tipo "Monday, December 25")
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
          console.error("Errore nel parsing della ricorrenza:", e);
          return false;
        }
      }
      
      // Altrimenti controllo se è la stessa data
      return eventDate && eventDate.toDateString() === date.toDateString();
    });
  };

  // Prendo gli eventi del giorno selezionato e li ordino per orario
  const getEventsForSelectedDate = () => {
    let eventsForDay = getEventsForDate(selectedDate);
    return eventsForDay.sort((a, b) => new Date(a.start) - new Date(b.start));
  };

  // Navigo tra i mesi (avanti e indietro)
  const navigateMonth = (direction) => {
    console.log("Navigo il mese di", direction > 0 ? "avanti" : "indietro");
    setCurrentDate(prev => {
      let newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      
      // If returning to current month, select server date (today)
      if (newDate.getMonth() === serverDate.getMonth() && newDate.getFullYear() === serverDate.getFullYear()) {
        setSelectedDate(serverDate);
        console.log("Torno al mese corrente, seleziono oggi (server date)");
      } else {
        // Otherwise select first of the month
        setSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
        console.log("Seleziono il primo del mese");
      }
      return newDate;
    });
  };

  // Calcolo tutti i giorni da mostrare nel calendario (sempre 42 per fare 6 settimane)
  const getDaysInMonth = (date) => {
    let year = date.getFullYear();
    let month = date.getMonth();
    let firstDay = new Date(year, month, 1);
    
    // Voglio che la settimana inizi di lunedì, quindi calcolo l'offset
    let dayOfWeek = firstDay.getDay(); // 0=domenica, 1=lunedì, ecc.
    let offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Se è domenica, torno indietro di 6

    let startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - offset);

    let days = [];
    for (let i = 0; i < 42; i++) { // 6 settimane x 7 giorni = 42 celle
      let day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    console.log("Giorni calcolati per il calendario:", days.length);
    return days;
  };

  // Funzioni di utilità per controllare le date
  const isToday = (date) => {
    return date.toDateString() === serverDate.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isSameMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Quando clicco su una data nel calendario
  const handleDateSelect = (date) => {
    console.log("Data selezionata:", date.toDateString());
    setSelectedDate(date); // Aggiorno la data selezionata
  };

  // Quando clicco sul bottone + per aggiungere un evento
  const handleNewEventButtonClick = () => {
    console.log("Creo nuovo evento per il", selectedDate.toDateString());
    setIsEditing(false); // Non sto modificando, sto creando
    setNewEvent({ 
      id: uuidv4(), // Genero un ID casuale
      title: "", 
      type: "event", 
      pomodoro: {
        _id: "",
        title: "",
        studyTime: null,
        breakTime: null,
        cycles: null,
      }, 
      activityDate: new Date(selectedDate), // Uso la data selezionata
      start: new Date(selectedDate), 
      end: new Date(new Date(selectedDate).getTime() + 60 * 60 * 1000), // +1 ora
      location: "",
      recurrenceRule: "",
      description: "",
      alarm: {
        earlyness: 15,
        repeat_times: 1,
        repeat_every: 0
      }
    });
    setShowModal(true); // Apro il modal
  };

  // Quando clicco su un evento esistente per modificarlo
  const handleEventClick = (eventData) => {
    console.log("Evento cliccato:", eventData.title);
    
    // Estraggo la ricorrenza se c'è
    let recurrenceValue = "";
    if (eventData.extendedProps && eventData.extendedProps.recurrenceRule) {
      let freqMatch = eventData.extendedProps.recurrenceRule.match(/FREQ=([A-Z]+)/);
      if (freqMatch && freqMatch[1]) {
        recurrenceValue = freqMatch[1].toLowerCase();
        console.log("Ricorrenza trovata:", recurrenceValue);
      }
    }

    let start = eventData.start || new Date();
    let end = eventData.end || new Date(start.getTime() + 3600000);

    // Preparo i dati per il modal
    let eventForModal = {
      id: eventData.id,
      title: eventData.title || "",
      type: eventData.extendedProps.type || "event",
      location: eventData.extendedProps.location || "",
      recurrenceRule: recurrenceValue,
      description: eventData.extendedProps.description || "",
      alarm: eventData.extendedProps.alarm || {
        earlyness: 15,
        repeat_times: 1,
        repeat_every: 0
      }
    };

    // Aggiungo le proprietà specifiche per ogni tipo
    if (eventForModal.type === "activity") {
      // For recurring activities, use the clicked occurrence date
      if (eventData.extendedProps.recurrenceRule && start) {
        eventForModal.activityDate = start; // Use the clicked occurrence date
      } else {
        eventForModal.activityDate = eventData.extendedProps.activityDate
          ? new Date(eventData.extendedProps.activityDate)
          : start;
      }
      console.log("Modifico attività per il", eventForModal.activityDate.toDateString());
    } else if (eventForModal.type === "pomodoro") {
      eventForModal.pomodoro = eventData.extendedProps.pomodoro || {
          title: "",
          studyTime: null,
          breakTime: null,
          cycles: null,
        };
      // For recurring pomodoros, use the clicked occurrence time
      eventForModal.start = start; // Use the clicked occurrence date/time
      eventForModal.end = end;     // Use the calculated end time for this occurrence
      console.log("Modifico pomodoro:", eventForModal.start, "-", eventForModal.end);
    } else {
      // For regular events, use the clicked occurrence date/time
      eventForModal.start = start; // This will be the specific occurrence date
      eventForModal.end = end;     // This will be the calculated end for this occurrence
      console.log("Modifico evento normale:", start, "-", end);
    }

    setIsEditing(true); // Sto modificando
    setNewEvent(eventForModal);
    setShowModal(true);
  };

  // Salvo l'evento (nuovo o modificato)
  const handleSaveEvent = () => {
    console.log("Salvo evento:", newEvent.title, "tipo:", newEvent.type);
    
    // Controllo che ci sia un titolo (tranne per i pomodoro)
    if (!newEvent.title && newEvent.type !== "pomodoro") {
      alert("Inserisci un titolo!");
      return;
    }

    // Scelgo URL e metodo in base se sto creando o modificando
    let url = isEditing
      ? `http://localhost:5000/api/events/update/${newEvent.id}`
      : "http://localhost:5000/api/events/save";
    let method = isEditing ? "PUT" : "POST";

    // Gestisco la ricorrenza se è stata impostata
    let rruleString = null;
    if ((newEvent.type === "event" || newEvent.type === "activity") && newEvent.recurrenceRule) {
      try {
        console.log("Creo ricorrenza per:", newEvent.recurrenceRule);
        
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
          console.error("Ricorrenza non valida:", newEvent.recurrenceRule);
          alert("Ricorrenza non valida");
          return;
        }
      } catch (error) {
        console.error("Errore nella creazione della ricorrenza:", error);
        alert("Errore nella ricorrenza");
        return;
      }
    }

    // Preparo i dati per il server
    let eventData = {
      title: newEvent.title || (newEvent.type === "pomodoro" ? "Sessione Pomodoro" : ""),
      description: newEvent.description || "",
      location: newEvent.location || "",
      type: newEvent.type,
      alarm: newEvent.alarm
    };

    // Aggiungo i campi specifici per ogni tipo
    if (newEvent.type === "activity") {
      eventData.activityDate = (newEvent.activityDate || new Date()).toISOString();
      eventData.recurrenceRule = rruleString;
      console.log("Dati attività:", eventData.activityDate, eventData.recurrenceRule);
    } else if (newEvent.type === "pomodoro") {
      eventData.pomodoro = newEvent.pomodoro.title || "";
      eventData.start = (newEvent.start || new Date()).toISOString();
      eventData.end = (newEvent.end || new Date(Date.now() + 25 * 60000)).toISOString();
      console.log("Dati pomodoro:", eventData.cyclesLeft, "cicli");
    } else {
      eventData.start = (newEvent.start || new Date()).toISOString();
      eventData.end = (newEvent.end || new Date(Date.now() + 3600000)).toISOString();
      eventData.recurrenceRule = rruleString;
      console.log("Dati evento:", eventData.start, "-", eventData.end);
    }

    if (isEditing) eventData._id = newEvent.id;
    console.log("Invio dati al server:", eventData);

    // Invio la richiesta al server
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Risposta server:", data);
        if (data.success) {
          console.log("Evento salvato con successo!");
          loadAllEvents(); // Ricarico tutti gli eventi
          setShowModal(false);
          resetForm();
        } else {
          console.error("Errore dal server:", data.message);
          alert(data.message);
        }
      })
      .catch((err) => {
        console.error("Errore nel salvataggio:", err);
        alert("Errore di connessione");
      });
  };

  // Elimino un evento
  const handleDeleteEvent = () => {
    if (!window.confirm("Sei sicuro di voler eliminare questo evento?")) {
      return;
    }
    
    console.log("Elimino evento:", newEvent.id);
    
    fetch(`http://localhost:5000/api/events/remove/${newEvent.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Risposta eliminazione:", data);
        if (data.success) {
          console.log("Evento eliminato!");
          loadAllEvents();
          setShowModal(false);
          resetForm();
        } else {
          console.error("Errore nell'eliminazione:", data.message);
          alert(data.message);
        }
      })
      .catch((err) => {
        console.error("Errore nell'eliminazione:", err);
        alert("Errore di connessione");
      });
  };

  // Resetto il form ai valori iniziali
  const resetForm = () => {
    console.log("Resetto il form");
    setNewEvent({
      id: "",
      title: "",
      type: "event",
      pomodoro: {
        _id: "",
        title: "",
        studyTime: null,
        breakTime: null,
        cycles: null,
      },
      activityDate: null,
      start: serverDate, // Use server date instead of new Date()
      end: serverDate,   // Use server date instead of new Date()
      location: "",
      recurrenceRule: "",
      description: "",
      alarm: {
        earlyness: 15,
        repeat_times: 1,
        repeat_every: 0
      }
    });
    setIsEditing(false);
  };

  // Renderizzo la vista del mese
  const renderMonthView = () => {
    let days = getDaysInMonth(currentDate);
    let dayLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']; 

    return (
      <div className={styles.monthViewContainer}>
        {/* Le etichette dei giorni della settimana */}
        <div className={styles.monthViewDayLabelsGrid}>
          {dayLabels.map(day => (
            <div key={day} className={styles.monthViewDayLabel}>
              {day}
            </div>
          ))}
        </div>
        
        {/* La griglia con tutti i giorni */}
        <div className={styles.monthViewDaysGrid}>
          {days.map((day, index) => {
            let dayEvents = getEventsForDate(day);
            
            // Calcolo le classi CSS per ogni cella
            let cellClasses = [
              styles.dayCell,
              styles.dayCellHover,
              isToday(day) ? styles.dayCellToday : '',
              isSelected(day) ? styles.dayCellSelected : '',
              !isSameMonth(day) ? styles.dayCellNotInMonth : ''
            ].join(' ').trim();

            return (
              <div
                key={index}
                onClick={() => handleDateSelect(day)}
                className={cellClasses}
              >
                <div className={styles.dayCellDateNumber}>
                  {day.getDate()}
                </div>
                
                {/* Mostro i primi 2 eventi nella cella */}
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={styles.dayCellEvent}
                    style={{ backgroundColor: event.color + '20', color: event.color }}
                  >
                    {event.title}
                  </div>
                ))}
                
                {/* Se ci sono più di 2 eventi, mostro il contatore */}
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
      {/* Header con navigazione mese */}
      <div className={styles.header}>
        <div className={styles.headerPadding}>
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
        {/* Riassunto degli eventi del giorno selezionato */}
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

        {/* Vista del mese */}
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

      {/* Modal per creare/modificare eventi */}
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