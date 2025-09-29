import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { RRule } from "rrule";
import EventModal from "./EventModal";
import styles from "./Calendario.module.css";

export default function CalendarApp() {
  // Stati principali del calendario
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [serverDate, setServerDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date()); // Data visualizzata
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
      enabled: false
    }
  });

  // Ottiene la data dal server
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
      console.error('Errore nel caricamento data server:', error);
    }
    return new Date();
  };

  // Carica data server ed eventi all'avvio
  useEffect(() => {
    const initializeCalendar = async () => {
      await fetchServerDate();
      loadAllEvents();
    };
    initializeCalendar();
  }, []);

  // Aggiorna periodicamente la data del server
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchServerDate();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Carica tutti gli eventi dal server
  const loadAllEvents = () => {
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setEvents(data.list);
        }
      })
      .catch((err) => {
        alert("Errore nel caricamento degli eventi");
      });
  };

  // Ottiene tutti gli eventi per una data specifica
  const getEventsForDate = (date) => {
    const eventsForDay = [];
    
    events.forEach(event => {
      if (!event.recurrenceRule || event.type === "activity") {
        // Eventi non ricorrenti e attività
        let eventStartDate, eventEndDate;
        
        if (event.type === "activity") {
          eventStartDate = new Date(event.activityDate);
          eventEndDate = new Date(event.activityDate);
          
          const eventDateOnly = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
          const targetDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          
          if (eventDateOnly.getTime() === targetDateOnly.getTime()) {
            eventsForDay.push(event);
          }
        } else {
          eventStartDate = new Date(event.start);
          eventEndDate = new Date(event.end);
          
          const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const startDate = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
          const endDate = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
          
          if (targetDate >= startDate && targetDate <= endDate) {
            eventsForDay.push(event);
          }
        }
      } else {
        // Eventi ricorrenti (escluse attività)
        try {
          // Estrai i dettagli della ricorrenza originale
          const originalStart = new Date(event.start);
          
          // Per eventi mensili, dobbiamo calcolare manualmente se è un'occorrenza valida
          if (event.recurrenceRule.includes('FREQ=MONTHLY')) {
            // Per ricorrenza mensile, controlla se il giorno del mese corrisponde
            const originalDay = originalStart.getDate();
            const targetDay = date.getDate();
            
            // Se i giorni corrispondono e la data target è >= alla data originale
            if (targetDay === originalDay && date >= new Date(originalStart.getFullYear(), originalStart.getMonth(), originalStart.getDate())) {
              const originalEnd = new Date(event.end);
              const eventDuration = originalEnd.getTime() - originalStart.getTime();
              
              const occurrenceStart = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                originalStart.getHours(),
                originalStart.getMinutes(),
                originalStart.getSeconds()
              );
              
              const occurrenceEnd = new Date(occurrenceStart.getTime() + eventDuration);
              
              const virtualEvent = {
                ...event,
                isRecurringInstance: true,
                originalId: event._id,
                start: occurrenceStart.toISOString(),
                end: occurrenceEnd.toISOString()
              };
              
              eventsForDay.push(virtualEvent);
            }
          } else {
            // Per altri tipi di ricorrenza (daily, weekly, yearly) usa RRule normale
            const rrule = RRule.fromString(event.recurrenceRule);
            
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
            const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
            
            const occurrences = rrule.between(startOfDay, endOfDay, true);
            
            if (occurrences.length > 0) {
              const originalEnd = new Date(event.end);
              const eventDuration = originalEnd.getTime() - originalStart.getTime();
              
              occurrences.forEach(occurrence => {
                const occurrenceStart = new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                  originalStart.getHours(),
                  originalStart.getMinutes(),
                  originalStart.getSeconds()
                );
                
                const occurrenceEnd = new Date(occurrenceStart.getTime() + eventDuration);
                
                const virtualEvent = {
                  ...event,
                  isRecurringInstance: true,
                  originalId: event._id,
                  start: occurrenceStart.toISOString(),
                  end: occurrenceEnd.toISOString()
                };
                
                eventsForDay.push(virtualEvent);
              });
            }
          }
        } catch (error) {
          console.error("Errore nell'elaborazione evento ricorrente:", error, event);
        }
      }
    });
    
    return eventsForDay;
  };

  // Gestisce il click su una data per creare un nuovo evento
  const handleDateClick = (date) => {
    setIsEditing(false);
    setNewEvent({
      id: uuidv4(),
      title: "",
      type: "event",
      pomodoro: {
        _id: "",
        title: "",
        studyTime: null,
        breakTime: null,
        cycles: null,
      },
      activityDate: date,
      start: date,
      end: new Date(date.getTime() + 60 * 60 * 1000), // +1 ora
      location: "",
      recurrenceRule: "",
      description: "",
      alarm: {
        earlyness: 15,
        repeat_times: 1,
        repeat_every: 0,
        enabled: false
      }
    });
    setShowModal(true);
  };

  // Gestisce il click su un evento esistente per modificarlo
  const handleEventClick = (event, clickedDate = null) => {
    // Estrae la ricorrenza se presente
    let recurrence = "";
    if (event.recurrenceRule && event.type !== "activity") {
      let freqMatch = event.recurrenceRule.match(/FREQ=([A-Z]+)/);
      if (freqMatch && freqMatch[1]) {
        recurrence = freqMatch[1].toLowerCase();
      }
    }

    // Per istanze ricorrenti usa la data cliccata, altrimenti quella originale
    let startDate, endDate;
    
    if (event.isRecurringInstance && clickedDate && event.type !== "activity") {
      const originalStart = new Date(event.start);
      const originalEnd = new Date(event.end);
      startDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(),
                          originalStart.getHours(), originalStart.getMinutes());
      endDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(),
                        originalEnd.getHours(), originalEnd.getMinutes());
    } else {
      // Evento normale o attività - validazione date
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
      recurrenceRule: event.type === "activity" ? "" : recurrence,
      description: event.description || "",
      alarm: {
        earlyness: event.alarm?.earlyness || 15,
        repeat_times: event.alarm?.repeat_times || 1,
        repeat_every: event.alarm?.repeat_every || 0,
        enabled: Boolean(event.alarm?.enabled)
      }
    };
    
    switch(eventData.type) {
      case "activity":
        const activityDateValue = event.activityDate && !isNaN(new Date(event.activityDate).getTime()) 
          ? new Date(event.activityDate) 
          : startDate;
        eventData.activityDate = activityDateValue;
        // Per le attività, solo enabled/disabled
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

  // Navigazione calendario
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

  // Genera il titolo basato sulla modalità di visualizzazione
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

  // Ottiene l'inizio della settimana (lunedì)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

  // Vista mensile
  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    
    // Calcola il primo giorno da mostrare nel calendario
    // Se il primo del mese è domenica (0), dobbiamo tornare indietro di 6 giorni
    // Se è lunedì (1), non torniamo indietro
    // Se è martedì (2), torniamo indietro di 1 giorno, ecc.
    let dayOfWeek = firstDay.getDay();
    // Converti domenica (0) a 7 per il calcolo
    if (dayOfWeek === 0) dayOfWeek = 7;
    
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - (dayOfWeek - 1));
    
    const days = [];
    const totalDays = 42; // 6 settimane x 7 giorni
    
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

  // Genera le fasce orarie per la vista giornaliera
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

  // Ottiene eventi per ora specifica
  const getEventsForHour = (date, hour) => {
    const dayEvents = getEventsForDate(date);
    return dayEvents.filter(event => {
      if (event.type === 'activity') return hour === 12; // Attività a mezzogiorno
      
      const eventStart = new Date(event.start);
      const eventHour = eventStart.getHours();
      const eventEnd = new Date(event.end);
      const eventEndHour = eventEnd.getHours();
      
      return hour >= eventHour && hour <= eventEndHour;
    });
  };

  // Salva un evento (nuovo o modificato)
  const handleSaveEvent = () => {
    // Validazione titolo
    if (!newEvent.title && newEvent.type !== "pomodoro") {
      alert("Inserisci un titolo!");
      return;
    }

    // Validazione date
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

    // Determina URL e metodo
    let url = isEditing
      ? `http://localhost:5000/api/events/update/${newEvent.id}`
      : "http://localhost:5000/api/events/save";
    let method = isEditing ? "PUT" : "POST";

    // Gestisce ricorrenza (solo per eventi e pomodoro, NON attività)
    let rruleString = null;
    if (newEvent.type !== "activity" && newEvent.recurrenceRule) {
      try {
        let frequencyMap = {
          'daily': RRule.DAILY,
          'weekly': RRule.WEEKLY,
          'monthly': RRule.MONTHLY,
          'yearly': RRule.YEARLY
        };
        
        let freq = frequencyMap[newEvent.recurrenceRule];
        
        if (freq !== undefined) {
          let startDate = newEvent.start || new Date();
          
          if (isNaN(new Date(startDate).getTime())) {
            alert("Data non valida per la ricorrenza!");
            return;
          }
          
          let rruleDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          rruleDate.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
          
          let rruleOptions = {
            freq: freq,
            dtstart: rruleDate
          };
          
          // Per ricorrenze settimanali, specifica il giorno
          if (newEvent.recurrenceRule === 'weekly') {
            let jsDay = rruleDate.getDay();
            let rruleDay;
            
            switch(jsDay) {
              case 0: rruleDay = RRule.SU; break;
              case 1: rruleDay = RRule.MO; break;
              case 2: rruleDay = RRule.TU; break;
              case 3: rruleDay = RRule.WE; break;
              case 4: rruleDay = RRule.TH; break;
              case 5: rruleDay = RRule.FR; break;
              case 6: rruleDay = RRule.SA; break;
              default: rruleDay = RRule.MO; break;
            }
            
            rruleOptions.byweekday = [rruleDay];
          } else if (newEvent.recurrenceRule === 'monthly') {
            let jsDay = rruleDate.getDay();
            let rruleDay;
            
            switch(jsDay) {
              case 0: rruleDay = RRule.SU; break;
              case 1: rruleDay = RRule.MO; break;
              case 2: rruleDay = RRule.TU; break;
              case 3: rruleDay = RRule.WE; break;
              case 4: rruleDay = RRule.TH; break;
              case 5: rruleDay = RRule.FR; break;
              case 6: rruleDay = RRule.SA; break;
              default: rruleDay = RRule.MO; break;
            }
            
            rruleOptions = {
              freq: freq,
              dtstart: rruleDate,
              bymonthday: rruleDate.getDate() // Forza il giorno del mese
            };
          }
          
          let rruleObj = new RRule(rruleOptions);
          rruleString = rruleObj.toString();
          
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

    // Prepara dati per il server
    let eventData = {
      title: newEvent.title || (newEvent.type === "pomodoro" ? "Sessione Pomodoro" : ""),
      description: newEvent.description || "",
      location: newEvent.location || "",
      type: newEvent.type,
      user: newEvent.user,
      alarm: newEvent.alarm
    };
    
    // Aggiungi proprietà specifiche per tipo
    switch(newEvent.type) {
      case "activity":
        let activityDate = newEvent.activityDate || new Date();
        if (isNaN(new Date(activityDate).getTime())) {
          alert("Data dell'attività non valida!");
          return;
        }
        // Per le attività, salva solo la data senza orario per evitare problemi di fuso orario
        const activityDateOnly = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate(), 12, 0, 0);
        eventData.activityDate = activityDateOnly.toISOString();
        break;
      case "pomodoro":
        eventData.pomodoro = newEvent.pomodoro.title || "";
        let pomodoroStart = newEvent.start || new Date();
        let pomodoroEnd = newEvent.end || new Date(Date.now() + 25 * 60000);
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
          loadAllEvents();
          setShowModal(false);
          resetForm();
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

  // Elimina un evento
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
          loadAllEvents();
          setShowModal(false);
          resetForm();
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

  // Resetta il form ai valori iniziali
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
      start: serverDate,
      end: serverDate,
      location: "",
      recurrenceRule: "",
      description: "",
      alarm: {
        earlyness: 15,
        repeat_times: 1,
        repeat_every: 0,
        enabled: false
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