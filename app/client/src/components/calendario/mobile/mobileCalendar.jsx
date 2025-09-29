import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Timer, Check, Grid3X3, CalendarDays, Clock } from 'lucide-react';
import { v4 as uuidv4 } from "uuid";
import { RRule } from "rrule";
import EventModal from './EventModal';
import EventList from './EventList';
import styles from './mobileCalendar.module.css';

const MobileCalendarApp = () => {
  // Stati del componente
  const [currentDate, setCurrentDate] = useState(new Date()); // Il mese che sto vedendo
  const [selectedDate, setSelectedDate] = useState(new Date()); // La data di cui vedo gli eventi
  const [serverDate, setServerDate] = useState(new Date()); // Add server date state
  const [events, setEvents] = useState([]); // Tutti gli eventi
  const [showModal, setShowModal] = useState(false); // Se mostro il modal o no
  const [isEditing, setIsEditing] = useState(false); // Se sto modificando o creando
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
      enabled: false // Aggiunto campo enabled per le attività
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

  // Funzione per caricare tutti gli eventi dal server
  const loadAllEvents = () => {
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include", // Per i cookie di autenticazione
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          
          // Trasformo gli eventi per il calendario mobile
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

            // A seconda del tipo di evento cambio colore e durata
            if (event.type === "activity") {
              // Le attività durano tutto il giorno e sono blu
              let actDate = event.activityDate ? new Date(event.activityDate) : serverDate;
              eventObj.start = actDate;
              eventObj.end = actDate;
              eventObj.allDay = true;
              eventObj.backgroundColor = "#4285F4";
              eventObj.color = "#4285F4";
            } else if (event.type === "pomodoro") {
              // I pomodoro durano 25 minuti e sono rossi
              eventObj.start = event.start ? new Date(event.start) : serverDate;
              eventObj.end = event.end ? new Date(event.end) : new Date(eventObj.start.getTime() + 25 * 60000);
              eventObj.backgroundColor = "#EA4335";
              eventObj.color = "#EA4335";
            } else {
              // Gli eventi normali hanno durata personalizzata e sono blu scuri
              eventObj.start = event.start ? new Date(event.start) : serverDate;
              eventObj.end = event.end ? new Date(event.end) : new Date(eventObj.start.getTime() + 3600000); // Default 1 ora
              eventObj.backgroundColor = "#3174ad";
              eventObj.color = "#3174ad";
            }

            return eventObj;
          });
          
          setEvents(eventsForMobile);
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
    const eventsForDay = [];
    
    events.forEach(event => {
      if (!event.extendedProps || !event.extendedProps.recurrenceRule || event.extendedProps.type === "activity") {
        // Eventi non ricorrenti e TUTTE le attività (ignora ricorrenza per le attività)
        let eventStartDate, eventEndDate;
        
        if (event.extendedProps?.type === "activity") {
          eventStartDate = new Date(event.extendedProps.activityDate || event.start);
          eventEndDate = new Date(event.extendedProps.activityDate || event.start); // Le attività durano un giorno
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
          const rrule = RRule.fromString(event.extendedProps.recurrenceRule);
          
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
                  originalId: event.id,
                  start: occurrenceStart,
                  end: occurrenceEnd
                };
                
                eventsForDay.push(virtualEvent);
              }
            });
          }
        } catch (error) {
          console.error("Error processing recurring event in mobile:", error);
        }
      }
    });
    
    return eventsForDay;
  };

  // Prendo gli eventi del giorno selezionato e li ordino per orario
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
      
      // Update selected date based on context
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

  // Helper per ottenere l'inizio della settimana (lunedì)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunedì come primo giorno
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
      if (event.extendedProps && event.extendedProps.type === 'activity') return hour === 12; // Mostra attività a mezzogiorno
      
      const eventStart = new Date(event.start);
      const eventHour = eventStart.getHours();
      const eventEnd = new Date(event.end);
      const eventEndHour = eventEnd.getHours();
      
      return hour >= eventHour && hour <= eventEndHour;
    });
  };

  // Quando clicco su una data nel calendario
  const handleDateSelect = (date) => {
    setSelectedDate(date); // Aggiorno la data selezionata
  };

  // Quando clicco sul bottone + per aggiungere un evento
  const handleNewEventButtonClick = () => {
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
    
    // Estraggo la ricorrenza se c'è (solo per eventi e pomodoro, NON per attività)
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

    // Preparo i dati per il modal
    let eventForModal = {
      id: eventData.id,
      title: eventData.title || "",
      type: eventData.extendedProps?.type || "event",
      location: eventData.extendedProps?.location || "",
      recurrenceRule: eventData.extendedProps?.type === "activity" ? "" : recurrenceValue, // Nessuna ricorrenza per le attività
      description: eventData.extendedProps?.description || "",
      alarm: eventData.extendedProps?.alarm || {
        earlyness: 15,
        repeat_times: 1,
        repeat_every: 0,
        enabled: false
      }
    };

    // Aggiungo le proprietà specifiche per ogni tipo
    if (eventForModal.type === "activity") {
      // Per le attività ricorrenti, usa la data dell'occorrenza cliccata
      if (eventData.isRecurringInstance) {
        eventForModal.activityDate = start; // Usa la data dell'occorrenza specifica
      } else {
        // Validazione della data dell'attività
        const activityDateValue = eventData.extendedProps?.activityDate && !isNaN(new Date(eventData.extendedProps.activityDate).getTime())
          ? new Date(eventData.extendedProps.activityDate)
          : start;
        eventForModal.activityDate = activityDateValue;
      }
      // Per le attività, semplifica l'alarm a solo enabled/disabled
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
      // Per i pomodori ricorrenti, usa l'orario dell'occorrenza cliccata
      eventForModal.start = start; // Usa l'orario dell'occorrenza specifica
      eventForModal.end = end;     // Usa l'orario di fine calcolato per questa occorrenza
    } else {
      // Per gli eventi normali, usa l'orario dell'occorrenza cliccata
      eventForModal.start = start; // Sarà la data/ora dell'occorrenza specifica
      eventForModal.end = end;     // Sarà la fine calcolata per questa occorrenza
    }

    setIsEditing(true); // Sto modificando
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
        
        // Mappo le opzioni del dropdown (stesso del desktop)
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
          
          let rruleOptions = {
            freq: freq,
            dtstart: rruleDate
          };
          
          // Per le ricorrenze settimanali, specifica il giorno (stesso del desktop)
          if (newEvent.recurrenceRule === 'weekly') {
            let jsDay = rruleDate.getDay(); // Giorno in formato JavaScript
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

    // Preparo i dati per il server
    let eventData = {
      title: newEvent.title || (newEvent.type === "pomodoro" ? "Sessione Pomodoro" : ""),
      description: newEvent.description || "",
      location: newEvent.location || "",
      type: newEvent.type,
      alarm: newEvent.alarm
    };

    // Aggiungo i campi specifici per ogni tipo
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

    // Invio la richiesta al server
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
          console.error("Mobile - Errore dal server:", data.message);
          alert(data.message);
        }
      })
      .catch((err) => {
        console.error("Mobile - Errore nel salvataggio:", err);
        alert("Errore di connessione");
      });
  };

  // Elimino un evento
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

  // Resetto il form ai valori iniziali
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

  // Renderizzo la vista settimanale
  const renderWeekView = () => {
    const weekDays = generateWeekDays();
    const dayLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

    return (
      <div className={styles.weekViewContainer}>
        {/* Header con i nomi dei giorni */}
        <div className={styles.weekViewHeader}>
          {dayLabels.map((dayLabel, index) => (
            <div key={index} className={styles.weekViewHeaderDay}>
              {dayLabel}
            </div>
          ))}
        </div>
        
        {/* Griglia dei giorni */}
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
                      // RIMOSSO onClick per l'evento - ora non è più cliccabile
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

  // Renderizzo la vista giornaliera
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

  // Renderizzo il contenuto principale basato sulla modalità
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
        // In modalità giornaliera, mostra solo la timeline senza lista separata
        return renderDayView();
      default: // Modalità mensile
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