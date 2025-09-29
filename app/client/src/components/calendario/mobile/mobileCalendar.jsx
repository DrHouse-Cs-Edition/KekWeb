import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Timer, Check, Grid3X3, CalendarDays, Clock } from 'lucide-react';
import { v4 as uuidv4 } from "uuid";
import { RRule } from "rrule";
import EventModal from './EventModal';
import EventList from './EventList';
import styles from './mobileCalendar.module.css';

const MobileCalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [serverDate, setServerDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  // Ottiene la data dal server tramite API time machine
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
        setCurrentDate(currentServerDate);
        setSelectedDate(currentServerDate);
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

  // Carica tutti gli eventi dal server
  const loadAllEvents = () => {
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Trasforma gli eventi per il calendario mobile
          let eventsForMobile = data.list.map((event) => {
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

            // Imposta colore e durata in base al tipo di evento
            if (event.type === "activity") {
              let actDate = event.activityDate ? new Date(event.activityDate) : serverDate;
              eventObj.start = actDate;
              eventObj.end = actDate;
              eventObj.allDay = true;
              eventObj.backgroundColor = "#4285F4";
              eventObj.color = "#4285F4";
            } else if (event.type === "pomodoro") {
              eventObj.start = event.start ? new Date(event.start) : serverDate;
              eventObj.end = event.end ? new Date(event.end) : new Date(eventObj.start.getTime() + 25 * 60000);
              eventObj.backgroundColor = "#EA4335";
              eventObj.color = "#EA4335";
            } else {
              eventObj.start = event.start ? new Date(event.start) : serverDate;
              eventObj.end = event.end ? new Date(event.end) : new Date(eventObj.start.getTime() + 3600000);
              eventObj.backgroundColor = "#3174ad";
              eventObj.color = "#3174ad";
            }

            return eventObj;
          });
          
          setEvents(eventsForMobile);
        }
      })
      .catch((err) => {
        console.error("Errore nel caricamento eventi:", err);
        alert("Errore nel caricamento degli eventi");
      });
  };

  // Restituisce l'icona appropriata per ogni tipo di evento
  const getEventIcon = (type) => {
    if (type === 'activity') return <Check className={styles.iconSizeSmall} />;
    if (type === 'pomodoro') return <Timer className={styles.iconSizeSmall} />;
    return <Calendar className={styles.iconSizeSmall} />;
  };

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

  // Ottiene tutti gli eventi per una data specifica
  const getEventsForDate = (date) => {
    const eventsForDay = [];
    
    events.forEach(event => {
      if (!event.extendedProps || !event.extendedProps.recurrenceRule || event.extendedProps.type === "activity") {
        // Eventi non ricorrenti e attività
        let eventStartDate, eventEndDate;
        
        if (event.extendedProps?.type === "activity") {
          eventStartDate = new Date(event.extendedProps.activityDate || event.start);
          eventEndDate = new Date(event.extendedProps.activityDate || event.start);
          
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
        // Eventi ricorrenti (solo per eventi e pomodoro)
        try {
          // Estrai i dettagli della ricorrente originale
          const originalStart = new Date(event.start);
          
          // Per eventi mensili, dobbiamo calcolare manualmente se è un'occorrenza valida
          if (event.extendedProps.recurrenceRule.includes('FREQ=MONTHLY')) {
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
                originalId: event.id,
                start: occurrenceStart,
                end: occurrenceEnd
              };
              
              eventsForDay.push(virtualEvent);
            }
          } else {
            // Per altri tipi di ricorrenza (daily, weekly, yearly) usa RRule normale
            const rrule = RRule.fromString(event.extendedProps.recurrenceRule);
            
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
                  originalId: event.id,
                  start: occurrenceStart,
                  end: occurrenceEnd
                };
                
                eventsForDay.push(virtualEvent);
              });
            }
          }
        } catch (error) {
          console.error("Errore nell'elaborazione evento ricorrente mobile:", error, event);
        }
      }
    });
    
    return eventsForDay;
  };

  // Ottiene gli eventi del giorno selezionato ordinati per orario
  const getEventsForSelectedDate = () => {
    let eventsForDay = getEventsForDate(selectedDate);
    return eventsForDay.sort((a, b) => new Date(a.start) - new Date(b.start));
  };

  // Navigazione basata sulla modalità di visualizzazione
  const navigateDate = (direction) => {
    setCurrentDate(prev => {
      let newDate = new Date(prev);
      
      switch(viewMode) {
        case 'month':
          newDate.setMonth(prev.getMonth() + direction);
          break;
        case 'week':
          newDate.setDate(prev.getDate() + (direction * 7));
          break;
        case 'day':
          newDate.setDate(prev.getDate() + direction);
          break;
      }
      
      // Aggiorna la data selezionata in base al contesto
      if (viewMode === 'month') {
        if (newDate.getMonth() === serverDate.getMonth() && newDate.getFullYear() === serverDate.getFullYear()) {
          setSelectedDate(serverDate);
        } else {
          setSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
        }
      } else {
        setSelectedDate(new Date(newDate));
      }
      
      return newDate;
    });
  };

  // Ottiene l'inizio della settimana (lunedì)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Genera il titolo basato sulla modalità
  const getViewTitle = () => {
    const year = currentDate.getFullYear();
    const monthNames = [
      "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
      "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];
    const month = monthNames[currentDate.getMonth()];
    
    switch(viewMode) {
      case 'month':
        return `${month} ${year}`;
      case 'week':
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.getDate()}-${weekEnd.getDate()} ${monthNames[weekStart.getMonth()]}`;
        } else {
          return `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]}`;
        }
      case 'day':
        const dayNames = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
        return `${dayNames[currentDate.getDay()]}, ${currentDate.getDate()} ${month}`;
      default:
        return `${month} ${year}`;
    }
  };

  // Genera i giorni della settimana
  const generateWeekDays = () => {
    const weekStart = getWeekStart(currentDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    
    return days;
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
      if (event.extendedProps && event.extendedProps.type === 'activity') return hour === 12;
      
      const eventStart = new Date(event.start);
      const eventHour = eventStart.getHours();
      const eventEnd = new Date(event.end);
      const eventEndHour = eventEnd.getHours();
      
      return hour >= eventHour && hour <= eventEndHour;
    });
  };

  // Gestisce la selezione di una data nel calendario
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Gestisce il click sul bottone per aggiungere un evento
  const handleNewEventButtonClick = () => {
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
      activityDate: new Date(selectedDate),
      start: new Date(selectedDate), 
      end: new Date(new Date(selectedDate).getTime() + 60 * 60 * 1000),
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
  const handleEventClick = (eventData) => {
    // Estrae la ricorrenza se presente (solo per eventi e pomodoro)
    let recurrenceValue = "";
    if (eventData.extendedProps && eventData.extendedProps.recurrenceRule && eventData.extendedProps.type !== "activity") {
      let freqMatch = eventData.extendedProps.recurrenceRule.match(/FREQ=([A-Z]+)/);
      if (freqMatch && freqMatch[1]) {
        recurrenceValue = freqMatch[1].toLowerCase();
      }
    }

    // Validazione delle date
    let start = eventData.start && !isNaN(new Date(eventData.start).getTime()) 
      ? new Date(eventData.start) 
      : new Date();
    let end = eventData.end && !isNaN(new Date(eventData.end).getTime()) 
      ? new Date(eventData.end) 
      : new Date(start.getTime() + 3600000);

    // Prepara i dati per il modal
    let eventForModal = {
      id: eventData.id,
      title: eventData.title || "",
      type: eventData.extendedProps?.type || "event",
      location: eventData.extendedProps?.location || "",
      recurrenceRule: eventData.extendedProps?.type === "activity" ? "" : recurrenceValue,
      description: eventData.extendedProps?.description || "",
      alarm: eventData.extendedProps?.alarm || {
        earlyness: 15,
        repeat_times: 1,
        repeat_every: 0,
        enabled: false
      }
    };

    // Aggiunge proprietà specifiche per tipo
    if (eventForModal.type === "activity") {
      if (eventData.isRecurringInstance) {
        eventForModal.activityDate = start;
      } else {
        const activityDateValue = eventData.extendedProps?.activityDate && !isNaN(new Date(eventData.extendedProps.activityDate).getTime())
          ? new Date(eventData.extendedProps.activityDate)
          : start;
        eventForModal.activityDate = activityDateValue;
      }
      eventForModal.alarm = {
        enabled: eventData.extendedProps?.alarm ? eventData.extendedProps.alarm.enabled || false : false
      };
    } else if (eventForModal.type === "pomodoro") {
      eventForModal.pomodoro = eventData.extendedProps?.pomodoro || {
          title: "",
          studyTime: null,
          breakTime: null,
          cycles: null,
        };
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

  // Salva l'evento (nuovo o modificato)
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

    // Gestisce ricorrenza (solo per eventi e pomodoro)
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
            // Per ricorrenze mensili, forza il giorno del mese
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
        console.error("Errore creazione ricorrenza mobile:", error);
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
      alarm: newEvent.alarm
    };

    // Aggiunge campi specifici per tipo
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
      .then((data) => {
        if (data.success) {
          loadAllEvents();
          setShowModal(false);
          resetForm();
        } else {
          console.error("Mobile - Errore dal server:", data.message);
          alert(data.message);
        }
      })
      .catch((err) => {
        console.error("Mobile - Errore nel salvataggio:", err);
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
      .then((data) => {
        if (data.success) {
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

  // Calcola tutti i giorni da mostrare nel calendario (42 per 6 settimane)
  const getDaysInMonth = (date) => {
    let year = date.getFullYear();
    let month = date.getMonth();
    let firstDay = new Date(year, month, 1);
    
    let dayOfWeek = firstDay.getDay();
    let offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    let startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - offset);

    let days = [];
    for (let i = 0; i < 42; i++) { 
      let day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
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

  // Renderizza la vista mensile
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

            return (
              <div
                key={index}
                onClick={() => handleDateSelect(day)}
                className={cellClasses}
              >
                <div className={styles.dayCellDateNumber}>
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

  // Renderizza la vista settimanale
  const renderWeekView = () => {
    const weekDays = generateWeekDays();
    const dayLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

    return (
      <div className={styles.weekViewContainer}>
        <div className={styles.weekViewHeader}>
          {dayLabels.map((dayLabel, index) => (
            <div key={index} className={styles.weekViewHeaderDay}>
              {dayLabel}
            </div>
          ))}
        </div>
        
        <div className={styles.weekViewGrid}>
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            
            const cellClasses = [
              styles.weekDayCell,
              isToday(day) ? styles.weekDayCellToday : '',
              isSelected(day) ? styles.weekDayCellSelected : ''
            ].join(' ').trim();

            return (
              <div
                key={index}
                onClick={() => handleDateSelect(day)}
                className={cellClasses}
              >
                <div className={styles.weekDayHeader}>
                  <div className={styles.weekDayNumber}>{day.getDate()}</div>
                </div>
                
                <div className={styles.weekDayEvents}>
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={styles.weekEventItem}
                      style={{ backgroundColor: event.color + '20', borderLeftColor: event.color }}
                    >
                      <div className={styles.weekEventTitle}>{event.title}</div>
                      <div className={styles.weekEventTime}>
                        {formatTime(new Date(event.start))}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className={styles.weekMoreEvents}>
                      +{dayEvents.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizza la vista giornaliera
  const renderDayView = () => {
    const timeSlots = generateTimeSlots();
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className={styles.dayViewContainer}>
        <div className={styles.dayViewHeader}>
          <h3 className={styles.dayViewTitle}>
            {isToday(currentDate) ? "Oggi" : formatDate(currentDate)}
          </h3>
          <div className={styles.dayViewSummary}>
            {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventi'}
          </div>
        </div>
        
        <div className={styles.dayViewContent}>
          {timeSlots.map(slot => {
            const hourEvents = getEventsForHour(currentDate, slot.hour);
            return (
              <div key={slot.hour} className={styles.dayTimeSlot}>
                <div className={styles.dayTimeLabel}>{slot.time}</div>
                <div 
                  className={styles.dayTimeContent}
                  onClick={() => {
                    const clickDate = new Date(currentDate);
                    clickDate.setHours(slot.hour, 0, 0, 0);
                    setSelectedDate(clickDate);
                    handleNewEventButtonClick();
                  }}
                >
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      className={styles.dayEventItem}
                      style={{ backgroundColor: event.color + '20', borderLeftColor: event.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      <div className={styles.dayEventHeader}>
                        <span className={styles.dayEventTitle}>{event.title}</span>
                        <span className={styles.dayEventTime}>
                          {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                        </span>
                      </div>
                      {event.extendedProps && event.extendedProps.location && (
                        <div className={styles.dayEventLocation}>
                          <MapPin size={12} />
                          {event.extendedProps.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizza il contenuto principale basato sulla modalità
  const renderMainContent = () => {
    switch(viewMode) {
      case 'week':
        return (
          <>
            <EventList
              events={getEventsForSelectedDate()}
              selectedDate={selectedDate}
              serverDate={serverDate}
              onEventClick={handleEventClick}
              maxEvents={5}
            />
            {renderWeekView()}
          </>
        );
      case 'day':
        return renderDayView();
      default:
        return (
          <>
            <EventList
              events={getEventsForSelectedDate()}
              selectedDate={selectedDate}
              serverDate={serverDate}
              onEventClick={handleEventClick}
              maxEvents={5}
            />
            {renderMonthView()}
          </>
        );
    }
  };

  return (
    <div className={styles.container}>
      {/* Header con navigazione e selezione modalità */}
      <div className={styles.header}>
        <div className={styles.headerPadding}>
          <div className={styles.monthNavigation}>
            <button
              onClick={() => navigateDate(-1)}
              className={`${styles.iconButton} ${styles.iconButtonHover}`}
            >
              <ChevronLeft className={styles.iconSize} />
            </button>
            <h2 className={styles.monthNavTitle}>
              {getViewTitle()}
            </h2>
            <button
              onClick={() => navigateDate(1)}
              className={`${styles.iconButton} ${styles.iconButtonHover}`}
            >
              <ChevronRight className={styles.iconSize} />
            </button>
          </div>
          
          {/* Selettore modalità visualizzazione */}
          <div className={styles.viewModeSelector}>
            <button 
              className={`${styles.viewModeButton} ${viewMode === 'month' ? styles.viewModeButtonActive : ''}`}
              onClick={() => setViewMode('month')}
            >
              <Grid3X3 size={16} />
              <span>Mese</span>
            </button>
            <button 
              className={`${styles.viewModeButton} ${viewMode === 'week' ? styles.viewModeButtonActive : ''}`}
              onClick={() => setViewMode('week')}
            >
              <CalendarDays size={16} />
              <span>Settimana</span>
            </button>
            <button 
              className={`${styles.viewModeButton} ${viewMode === 'day' ? styles.viewModeButtonActive : ''}`}
              onClick={() => setViewMode('day')}
            >
              <Clock size={16} />
              <span>Giorno</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className={styles.mainContent}>
        {renderMainContent()}
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