import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { RRule } from "rrule";
import EventModal from "./EventModal";
import styles from "./Calendario.module.css";

export default function CalendarApp() {
  // Stati per gestire il calendario
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [serverDate, setServerDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date()); // Data che sto visualizzando
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
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
      repeat_every: 0,
      enabled: false // Aggiunto campo enabled
    }
  });

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
        return currentServerDate;
      }
    } catch (error) {
      console.error('Error fetching server date:', error);
    }
    return new Date();
  };

  // Load server date and events when component mounts
  useEffect(() => {
    const initializeCalendar = async () => {
      await fetchServerDate();
      loadAllEvents();
    };
    initializeCalendar();
  }, []);

  // Add periodic update of server date
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchServerDate();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Funzione per caricare tutti gli eventi dal server
  const loadAllEvents = () => {
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setEvents(data.list);
        } else {
          console.log("Nessun evento trovato");
        }
      })
      .catch((err) => {
        alert("Errore nel caricamento degli eventi");
      });
  };

  // Funzione per ottenere gli eventi di una specifica data
  const getEventsForDate = (date) => {
    const eventsForDay = [];
    
    events.forEach(event => {
      if (!event.recurrenceRule || event.type === "activity") {
        // Eventi non ricorrenti e TUTTE le attività (ignora ricorrenza per le attività)
        let eventStartDate, eventEndDate;
        
        if (event.type === "activity") {
          eventStartDate = new Date(event.activityDate);
          eventEndDate = new Date(event.activityDate); // Le attività durano un giorno
        } else {
          eventStartDate = new Date(event.start);
          eventEndDate = new Date(event.end);
        }
        
        // Normalizza le date per confronto (rimuovi ore/minuti/secondi)
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const startDate = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
        const endDate = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
        
        // Controlla se la data target è compresa tra inizio e fine evento (inclusi)
        if (targetDate >= startDate && targetDate <= endDate) {
          eventsForDay.push(event);
        }
      } else {
        // Eventi ricorrenti - solo per eventi e pomodoro, NON per attività
        try {
          const rrule = RRule.fromString(event.recurrenceRule);
          
          // FIX: Usa la stessa logica UTC del salvataggio
          let targetDateUTC = new Date(Date.UTC(
            date.getFullYear(), 
            date.getMonth(), 
            date.getDate(), 
            12, 0, 0, 0
          ));
          
          let startOfDayUTC = new Date(Date.UTC(
            date.getFullYear(), 
            date.getMonth(), 
            date.getDate(), 
            0, 0, 0, 0
          ));
          
          let endOfDayUTC = new Date(Date.UTC(
            date.getFullYear(), 
            date.getMonth(), 
            date.getDate(), 
            23, 59, 59, 999
          ));
          
          const occurrences = rrule.between(startOfDayUTC, endOfDayUTC, true);
          
          if (occurrences.length > 0) {
            // Per ogni occorrenza, controlla se l'evento si estende su più giorni
            occurrences.forEach(occurrence => {
              const originalStart = new Date(event.start);
              const originalEnd = new Date(event.end);
              
              // Calcola la durata originale dell'evento
              const eventDuration = originalEnd.getTime() - originalStart.getTime();
              
              // Crea le date di inizio e fine per questa occorrenza
              const occurrenceStart = new Date(
                occurrence.getFullYear(), 
                occurrence.getMonth(), 
                occurrence.getDate(),
                originalStart.getHours(), 
                originalStart.getMinutes()
              );
              
              const occurrenceEnd = new Date(occurrenceStart.getTime() + eventDuration);
              
              // Normalizza le date per confronto
              const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              const startDate = new Date(occurrenceStart.getFullYear(), occurrenceStart.getMonth(), occurrenceStart.getDate());
              const endDate = new Date(occurrenceEnd.getFullYear(), occurrenceEnd.getMonth(), occurrenceEnd.getDate());
              
              // Controlla se la data target è compresa nell'evento ricorrente
              if (targetDate >= startDate && targetDate <= endDate) {
                const virtualEvent = {
                  ...event,
                  isRecurringInstance: true,
                  originalId: event._id,
                  start: occurrenceStart.toISOString(),
                  end: occurrenceEnd.toISOString()
                };
                
                eventsForDay.push(virtualEvent);
              }
            });
          }
        } catch (error) {
          console.error("Error processing recurring event:", error);
        }
      }
    });
    
    return eventsForDay;
  };

  // Funzione per gestire il click su una data (creare evento)
  const handleDateClick = (date) => {
    
    setIsEditing(false);
    setNewEvent({
      ...newEvent,
      id: uuidv4(),
      start: date,
      end: new Date(date.getTime() + 60 * 60 * 1000), // +1 ora
      activityDate: date,
      type: "event",
      recurrenceRule: "",
    });
    setShowModal(true);
  };

  // Funzione per gestire il click su un evento (modificare)
  const handleEventClick = (event, clickedDate = null) => {
    
    // Estraggo la ricorrenza se c'è (solo per eventi e pomodoro, NON per attività)
    let recurrence = "";
    if (event.recurrenceRule && event.type !== "activity") {
      let freqMatch = event.recurrenceRule.match(/FREQ=([A-Z]+)/);
      if (freqMatch && freqMatch[1]) {
        recurrence = freqMatch[1].toLowerCase();
      }
    }

    // For recurring instances, use the clicked date; otherwise use original date
    let startDate, endDate;
    
    if (event.isRecurringInstance && clickedDate && event.type !== "activity") {
      // This is a recurring instance (non-activity)
      const originalStart = new Date(event.start);
      const originalEnd = new Date(event.end);
      startDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(),
                          originalStart.getHours(), originalStart.getMinutes());
      endDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(),
                        originalEnd.getHours(), originalEnd.getMinutes());
    } else {
      // Regular event or activity - validazione delle date
      startDate = event.start && !isNaN(new Date(event.start).getTime()) 
        ? new Date(event.start) 
        : new Date();
      endDate = event.end && !isNaN(new Date(event.end).getTime()) 
        ? new Date(event.end) 
        : new Date(startDate.getTime() + 3600000);
    }
    
    let eventData = {
      id: event._id,
      title: event.title || "",
      type: event.type || "event",
      location: event.location || "",
      recurrenceRule: event.type === "activity" ? "" : recurrence, // Nessuna ricorrenza per le attività
      description: event.description || "",
      alarm: event.alarm || {
        earlyness: 15,
        repeat_times: 1,
        repeat_every: 0,
        enabled: false
      }
    };
    
    switch(eventData.type) {
      case "activity":
        // Validazione della data dell'attività
        const activityDateValue = event.activityDate && !isNaN(new Date(event.activityDate).getTime()) 
          ? new Date(event.activityDate) 
          : startDate;
        eventData.activityDate = activityDateValue;
        // Per le attività, semplifica l'alarm a solo enabled/disabled
        eventData.alarm = {
          enabled: event.alarm ? event.alarm.enabled || false : false
        };
        break;
      case "pomodoro":
        eventData.pomodoro = event.pomodoro || {
          title: "",
          studyTime: null,
          breakTime: null,
          cycles: null,
        };
        eventData.start = startDate;
        eventData.end = endDate;
        break;
      case "event":
      default:
        eventData.start = startDate;
        eventData.end = endDate;
        break;
    }
    
    setIsEditing(true);
    setNewEvent(eventData);
    setShowModal(true);
  };

  // Navigazione basata sulla modalità di visualizzazione
  const goToPrevious = () => {
    switch(viewMode) {
      case 'month':
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        break;
      case 'week':
        setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
        break;
      case 'day':
        setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
        break;
    }
  };

  const goToNext = () => {
    switch(viewMode) {
      case 'month':
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        break;
      case 'week':
        setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
        break;
      case 'day':
        setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date(serverDate));
  };

  // Genera il titolo basato sulla modalità
  const getViewTitle = () => {
    const year = currentDate.getFullYear();
    const month = monthNames[currentDate.getMonth()];
    
    switch(viewMode) {
      case 'month':
        return `${month} ${year}`;
      case 'week':
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.getDate()}-${weekEnd.getDate()} ${monthNames[weekStart.getMonth()]} ${year}`;
        } else {
          return `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]} ${year}`;
        }
      case 'day':
        return `${currentDate.getDate()} ${month} ${year}`;
      default:
        return `${month} ${year}`;
    }
  };

  // Helper per ottenere l'inizio della settimana (lunedì)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunedì come primo giorno
    return new Date(d.setDate(diff));
  };

  // Genera i giorni del calendario basato sulla modalità
  const generateCalendarDays = () => {
    switch(viewMode) {
      case 'month':
        return generateMonthDays();
      case 'week':
        return generateWeekDays();
      case 'day':
        return generateDayView();
      default:
        return generateMonthDays();
    }
  };

  // Vista mensile (esistente)
  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);
    
    const days = [];
    const totalDays = 42;
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = 
        date.getDate() === serverDate.getDate() &&
        date.getMonth() === serverDate.getMonth() &&
        date.getFullYear() === serverDate.getFullYear();
      
      const dayEvents = getEventsForDate(date);
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        events: dayEvents
      });
    }
    
    return days;
  };

  // Vista settimanale
  const generateWeekDays = () => {
    const weekStart = getWeekStart(currentDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const isToday = 
        date.getDate() === serverDate.getDate() &&
        date.getMonth() === serverDate.getMonth() &&
        date.getFullYear() === serverDate.getFullYear();
      
      const dayEvents = getEventsForDate(date);
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        events: dayEvents
      });
    }
    
    return days;
  };

  // Vista giornaliera
  const generateDayView = () => {
    const isToday = 
      currentDate.getDate() === serverDate.getDate() &&
      currentDate.getMonth() === serverDate.getMonth() &&
      currentDate.getFullYear() === serverDate.getFullYear();
    
    const dayEvents = getEventsForDate(currentDate);
    
    return [{
      date: new Date(currentDate),
      isCurrentMonth: true,
      isToday,
      events: dayEvents
    }];
  };

  // Genera le ore per la vista giornaliera
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour: hour
      });
    }
    return slots;
  };

  // Ottieni eventi per ora specifica
  const getEventsForHour = (date, hour) => {
    const dayEvents = getEventsForDate(date);
    return dayEvents.filter(event => {
      if (event.type === 'activity') return hour === 12; // Mostra attività a mezzogiorno
      
      const eventStart = new Date(event.start);
      const eventHour = eventStart.getHours();
      const eventEnd = new Date(event.end);
      const eventEndHour = eventEnd.getHours();
      
      return hour >= eventHour && hour <= eventEndHour;
    });
  };

  // Funzione per salvare l'evento (nuovo o modificato)
  const handleSaveEvent = () => {
    
    // Controllo che ci sia un titolo (tranne per i pomodoro)
    if (!newEvent.title && newEvent.type !== "pomodoro") {
      alert("Inserisci un titolo!");
      return;
    }

    // Validazione date per evitare errori
    if (newEvent.type !== "activity") {
      if (!newEvent.start || isNaN(new Date(newEvent.start).getTime())) {
        alert("Data di inizio non valida!");
        return;
      }
      if (!newEvent.end || isNaN(new Date(newEvent.end).getTime())) {
        alert("Data di fine non valida!");
        return;
      }
      if (new Date(newEvent.start) >= new Date(newEvent.end)) {
        alert("La data di fine deve essere successiva alla data di inizio!");
        return;
      }
    } else {
      if (!newEvent.activityDate || isNaN(new Date(newEvent.activityDate).getTime())) {
        alert("Data dell'attività non valida!");
        return;
      }
    }

    // Scelgo URL e metodo in base se sto creando o modificando
    let url = isEditing
      ? `http://localhost:5000/api/events/update/${newEvent.id}`
      : "http://localhost:5000/api/events/save";
    let method = isEditing ? "PUT" : "POST";

    // Gestisco la ricorrenza SOLO per eventi e pomodoro, NON per le attività
    let rruleString = null;
    if (newEvent.type !== "activity" && newEvent.recurrenceRule) {
      try {
        
        // Mappo le opzioni del dropdown
        let frequencyMap = {
          'daily': RRule.DAILY,
          'weekly': RRule.WEEKLY,
          'monthly': RRule.MONTHLY,
          'yearly': RRule.YEARLY
        };
        
        let freq = frequencyMap[newEvent.recurrenceRule];
        
        if (freq !== undefined) {
          let startDate = newEvent.start || new Date();
          
          // Validazione della data per RRule
          if (isNaN(new Date(startDate).getTime())) {
            alert("Data non valida per la ricorrenza!");
            return;
          }
          
          // Crea la data senza problemi di timezone
          let rruleDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          
          // Per gli eventi, mantieni l'ora originale
          rruleDate.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
          
          // FIX: Per le ricorrenze settimanali, specifica il giorno della settimana
          let rruleOptions = {
            freq: freq,
            dtstart: rruleDate
          };
          
          // Se è settimanale, aggiungi il giorno specifico
          if (newEvent.recurrenceRule === 'weekly') {
            let jsDay = rruleDate.getDay(); // Giorno in formato JavaScript
            let rruleDay;
            
            // Converti da JavaScript day a RRule day
            switch(jsDay) {
              case 0: rruleDay = RRule.SU; break; // Domenica
              case 1: rruleDay = RRule.MO; break; // Lunedì
              case 2: rruleDay = RRule.TU; break; // Martedì
              case 3: rruleDay = RRule.WE; break; // Mercoledì
              case 4: rruleDay = RRule.TH; break; // Giovedì
              case 5: rruleDay = RRule.FR; break; // Venerdì
              case 6: rruleDay = RRule.SA; break; // Sabato
              default: rruleDay = RRule.MO; break;
            }
            
            rruleOptions.byweekday = [rruleDay];
          }
          
          let rruleObj = new RRule(rruleOptions);
          rruleString = rruleObj.toString();
          
          // Debug: verifica le prime occorrenze
          const testOccurrences = rruleObj.between(
            new Date(rruleDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 settimana prima
            new Date(rruleDate.getTime() + 14 * 24 * 60 * 60 * 1000)  // 2 settimane dopo
          );
          
        } else {
          console.error("Ricorrenza non valida:", newEvent.recurrenceRule);
          alert("Ricorrenza non valida");
          return;
        }
      } catch (error) {
        console.error("Errore creazione ricorrenza:", error);
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
      user: newEvent.user,
      alarm: newEvent.alarm
    };
    
    // Add type-specific properties
    switch(newEvent.type) {
      case "activity":
        let activityDate = newEvent.activityDate || new Date();
        // Validazione finale della data dell'attività
        if (isNaN(new Date(activityDate).getTime())) {
          alert("Data dell'attività non valida!");
          return;
        }
        eventData.activityDate = new Date(activityDate).toISOString();
        // NON inviare recurrenceRule per le attività
        break;
      case "pomodoro":
        eventData.pomodoro = newEvent.pomodoro.title || "";
        let pomodoroStart = newEvent.start || new Date();
        let pomodoroEnd = newEvent.end || new Date(Date.now() + 25 * 60000);
        // Validazione date pomodoro
        if (isNaN(new Date(pomodoroStart).getTime()) || isNaN(new Date(pomodoroEnd).getTime())) {
          alert("Date del pomodoro non valide!");
          return;
        }
        eventData.start = new Date(pomodoroStart).toISOString();
        eventData.end = new Date(pomodoroEnd).toISOString();
        eventData.recurrenceRule = rruleString;
        break;
      case "event":
      default:
        let eventStart = newEvent.start || new Date();
        let eventEnd = newEvent.end || new Date(Date.now() + 3600000);
        // Validazione date evento
        if (isNaN(new Date(eventStart).getTime()) || isNaN(new Date(eventEnd).getTime())) {
          alert("Date dell'evento non valide!");
          return;
        }
        eventData.start = new Date(eventStart).toISOString();
        eventData.end = new Date(eventEnd).toISOString();
        eventData.recurrenceRule = rruleString;
        break;
    }
    
    if (isEditing) eventData._id = newEvent.id;

    // Invio al server
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          loadAllEvents(); // Ricarico la lista
          setShowModal(false); // Chiudo il modal
          resetForm(); // Pulisco il form
        } else {
          console.error("Errore dal server:", result.message);
          alert(result.message);
        }
      })
      .catch((err) => {
        console.error("Errore nel salvataggio:", err);
        alert("Errore di connessione");
      });
  };

  // Funzione per eliminare un evento
  const handleDeleteEvent = () => {
    if (!window.confirm("Sei sicuro di voler eliminare questo evento?")) {
      return;
    }
    
    fetch(`http://localhost:5000/api/events/remove/${newEvent.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          loadAllEvents(); // Ricarico la lista
          setShowModal(false); // Chiudo il modal
          resetForm(); // Pulisco il form
        } else {
          console.error("Errore eliminazione:", result.message);
          alert(result.message);
        }
      })
      .catch((err) => {
        console.error("Errore nell'eliminazione:", err);
        alert("Errore di connessione");
      });
  };

  // Funzione per resettare il form
  const resetForm = () => {
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
        repeat_every: 0,
        enabled: false // Aggiunto campo enabled
      }
    });
    setIsEditing(false);
  };

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  const dayNames = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const dayNamesLong = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

  return (
    <div className={styles.calendarContainer}>
      {/* Header del calendario */}
      <div className={styles.calendarHeader}>
        <div className={styles.navigationControls}>
          <button onClick={goToPrevious} className={styles.navButton}>
            ◀
          </button>
          <button onClick={goToToday} className={styles.todayButton}>
            Oggi
          </button>
          <button onClick={goToNext} className={styles.navButton}>
            ▶
          </button>
        </div>
        
        <h2 className={styles.monthTitle}>
          {getViewTitle()}
        </h2>

        {/* Selettore modalità visualizzazione */}
        <div className={styles.viewModeSelector}>
          <button 
            className={`${styles.viewModeButton} ${viewMode === 'month' ? styles.active : ''}`}
            onClick={() => setViewMode('month')}
          >
            Mese
          </button>
          <button 
            className={`${styles.viewModeButton} ${viewMode === 'week' ? styles.active : ''}`}
            onClick={() => setViewMode('week')}
          >
            Settimana
          </button>
          <button 
            className={`${styles.viewModeButton} ${viewMode === 'day' ? styles.active : ''}`}
            onClick={() => setViewMode('day')}
          >
            Giorno
          </button>
        </div>
      </div>

      {/* Contenuto del calendario basato sulla modalità */}
      {viewMode === 'day' ? (
        // Vista giornaliera
        <div className={styles.dayView}>
          <div className={styles.dayViewHeader}>
            <h3 className={styles.dayViewTitle}>
              {dayNamesLong[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1]}, {currentDate.getDate()} {monthNames[currentDate.getMonth()]}
            </h3>
          </div>
          
          <div className={styles.dayViewContent}>
            <div className={styles.timeColumn}>
              {generateTimeSlots().map(slot => (
                <div key={slot.hour} className={styles.timeSlot}>
                  {slot.time}
                </div>
              ))}
            </div>
            
            <div className={styles.eventsColumn}>
              {generateTimeSlots().map(slot => {
                const hourEvents = getEventsForHour(currentDate, slot.hour);
                return (
                  <div 
                    key={slot.hour} 
                    className={styles.hourSlot}
                    onClick={() => {
                      const clickDate = new Date(currentDate);
                      clickDate.setHours(slot.hour, 0, 0, 0);
                      handleDateClick(clickDate);
                    }}
                  >
                    {hourEvents.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`${styles.eventItem} ${styles[`event-${event.type}`]}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event, currentDate);
                        }}
                      >
                        {event.title || "Evento"}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        // Vista mensile/settimanale
        <div className={`${styles.calendarGrid} ${styles[`${viewMode}Grid`]}`}>
          {/* Header giorni della settimana */}
          {(viewMode === 'month' || viewMode === 'week') && dayNames.map(day => (
            <div key={day} className={styles.dayHeader}>
              {day}
            </div>
          ))}
          
          {/* Giorni del calendario */}
          {generateCalendarDays().map((day, index) => (
            <div
              key={index}
              className={`${styles.dayCell} ${
                !day.isCurrentMonth ? styles.otherMonth : ''
              } ${day.isToday ? styles.today : ''} ${styles[`${viewMode}Cell`]}`}
              onClick={() => handleDateClick(day.date)}
            >
              <div className={styles.dayNumber}>
                {viewMode === 'week' && (
                  <span className={styles.dayName}>
                    {dayNames[day.date.getDay() === 0 ? 6 : day.date.getDay() - 1]}
                  </span>
                )}
                {day.date.getDate()}
              </div>
              
              {/* Eventi del giorno */}
              <div className={styles.dayEvents}>
                {day.events.slice(0, viewMode === 'week' ? 4 : 3).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`${styles.eventItem} ${styles[`event-${event.type}`]}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event, day.date);
                    }}
                  >
                    {event.title || "Evento"}
                  </div>
                ))}
                {day.events.length > (viewMode === 'week' ? 4 : 3) && (
                  <div className={styles.moreEvents}>
                    +{day.events.length - (viewMode === 'week' ? 4 : 3)} altri
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <EventModal
          isEditing={isEditing}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          handleSaveEvent={handleSaveEvent}
          handleDeleteEvent={handleDeleteEvent}
          setShowModal={setShowModal}
          resetForm={resetForm}
        />
      )}
    </div>
  );
}