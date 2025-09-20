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
    const eventsForDay = [];
    
    events.forEach(event => {
      if (!event.extendedProps || !event.extendedProps.recurrenceRule) {
        // Eventi non ricorrenti - gestione normale
        let eventDate = event.start ? new Date(event.start) : null;
        
        // Altrimenti controllo se è la stessa data
        if (eventDate && eventDate.toDateString() === date.toDateString()) {
          eventsForDay.push(event);
        }
      } else {
        // Eventi ricorrenti - gestione con UTC (copiata dal desktop)
        try {
          const rrule = RRule.fromString(event.extendedProps.recurrenceRule);
          
          // FIX: Usa la stessa logica UTC del salvataggio
          // Crea la data target in UTC a mezzogiorno
          let targetDateUTC = new Date(Date.UTC(
            date.getFullYear(), 
            date.getMonth(), 
            date.getDate(), 
            12, 0, 0, 0
          ));
          
          // Controlla solo questo giorno specifico in UTC
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
          
          // Ottieni tutte le occorrenze per questo giorno
          const occurrences = rrule.between(startOfDayUTC, endOfDayUTC, true);
          
          // Debug per vedere cosa sta succedendo
          if (event.title === "prova") {
            console.log(`Controllo evento mobile "${event.title}" per ${date.toDateString()}:`);
            console.log("- Data target UTC:", targetDateUTC.toISOString());
            console.log("- Range UTC:", startOfDayUTC.toISOString(), "->", endOfDayUTC.toISOString());
            console.log("- Occorrenze trovate:", occurrences.length);
            console.log("- RRule originale:", event.extendedProps.recurrenceRule);
          }
          
          if (occurrences.length > 0) {
            // Crea l'evento virtuale per questa occorrenza (stesso formato del desktop)
            const virtualEvent = {
              ...event,
              isRecurringInstance: true,
              originalId: event.id,
            };
            
            if (event.extendedProps.type === "activity") {
              // Per le attività, usa la data locale
              virtualEvent.start = new Date(
                date.getFullYear(), 
                date.getMonth(), 
                date.getDate()
              );
              virtualEvent.end = new Date(
                date.getFullYear(), 
                date.getMonth(), 
                date.getDate()
              );
              virtualEvent.extendedProps.activityDate = virtualEvent.start;
            } else {
              // Per gli eventi, mantieni l'ora originale ma usa la data corrente
              const originalStart = new Date(event.start);
              const originalEnd = new Date(event.end);
              
              virtualEvent.start = new Date(
                date.getFullYear(), 
                date.getMonth(), 
                date.getDate(),
                originalStart.getHours(), 
                originalStart.getMinutes()
              );
              
              virtualEvent.end = new Date(
                date.getFullYear(), 
                date.getMonth(), 
                date.getDate(),
                originalEnd.getHours(), 
                originalEnd.getMinutes()
              );
            }
            
            eventsForDay.push(virtualEvent);
          }
        } catch (error) {
          console.error("Error processing recurring event in mobile:", error);
          console.error("Evento problematico:", event);
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
    console.log("Navigo di", direction > 0 ? "avanti" : "indietro", "in modalità", viewMode);
    
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
    console.log("Mobile - Evento cliccato:", eventData.title);
    
    // Estraggo la ricorrenza se c'è (stessa logica del desktop)
    let recurrenceValue = "";
    if (eventData.extendedProps && eventData.extendedProps.recurrenceRule) {
      let freqMatch = eventData.extendedProps.recurrenceRule.match(/FREQ=([A-Z]+)/);
      if (freqMatch && freqMatch[1]) {
        recurrenceValue = freqMatch[1].toLowerCase();
        console.log("Mobile - Ricorrenza trovata:", recurrenceValue);
      }
    }

    let start = eventData.start || new Date();
    let end = eventData.end || new Date(start.getTime() + 3600000);

    // Preparo i dati per il modal
    let eventForModal = {
      id: eventData.id,
      title: eventData.title || "",
      type: eventData.extendedProps?.type || "event",
      location: eventData.extendedProps?.location || "",
      recurrenceRule: recurrenceValue, // Usa la ricorrenza estratta
      description: eventData.extendedProps?.description || "",
      alarm: eventData.extendedProps?.alarm || {
        earlyness: 15,
        repeat_times: 1,
        repeat_every: 0
      }
    };

    // Aggiungo le proprietà specifiche per ogni tipo (stessa logica del desktop)
    if (eventForModal.type === "activity") {
      // Per le attività ricorrenti, usa la data dell'occorrenza cliccata
      if (eventData.isRecurringInstance) {
        eventForModal.activityDate = start; // Usa la data dell'occorrenza specifica
      } else {
        eventForModal.activityDate = eventData.extendedProps?.activityDate
          ? new Date(eventData.extendedProps.activityDate)
          : start;
      }
      console.log("Mobile - Modifico attività per il", eventForModal.activityDate.toDateString());
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
      console.log("Mobile - Modifico pomodoro:", eventForModal.start, "-", eventForModal.end);
    } else {
      // Per gli eventi normali, usa l'orario dell'occorrenza cliccata
      eventForModal.start = start; // Sarà la data/ora dell'occorrenza specifica
      eventForModal.end = end;     // Sarà la fine calcolata per questa occorrenza
      console.log("Mobile - Modifico evento normale:", start, "-", end);
    }

    setIsEditing(true); // Sto modificando
    setNewEvent(eventForModal);
    setShowModal(true);
  };

  // Salvo l'evento (nuovo o modificato)
  const handleSaveEvent = () => {
    console.log("Salvo evento mobile:", newEvent.title, "tipo:", newEvent.type);
    
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

    // Gestisco la ricorrenza con la stessa logica del desktop
    let rruleString = null;
    if ((newEvent.type === "event" || newEvent.type === "activity") && newEvent.recurrenceRule) {
      try {
        console.log("Creo ricorrenza mobile per:", newEvent.recurrenceRule);
        
        // Mappo le opzioni del dropdown (stesso del desktop)
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
          
          // FIX: Crea sempre la data in UTC per evitare problemi di timezone (stesso del desktop)
          let year = startDate.getFullYear();
          let month = startDate.getMonth();
          let day = startDate.getDate();
          let hour = newEvent.type === "activity" ? 12 : startDate.getHours(); // Usa mezzogiorno per le attività
          let minute = newEvent.type === "activity" ? 0 : startDate.getMinutes();
          
          // Crea la data direttamente in UTC
          let rruleDate = new Date(Date.UTC(year, month, day, hour, minute, 0, 0));
          
          let rruleOptions = {
            freq: freq,
            dtstart: rruleDate
          };
          
          // Per le ricorrenze settimanali, specifica il giorno (stesso del desktop)
          if (newEvent.recurrenceRule === 'weekly') {
            let jsDay = new Date(year, month, day).getDay(); // Usa data locale per determinare il giorno
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
            console.log("Mobile - Giorno della settimana fissato:", jsDay, "->", rruleDay);
          }
          
          let rruleObj = new RRule(rruleOptions);
          rruleString = rruleObj.toString();
          console.log("Mobile - RRule creata (UTC):", rruleString);
          
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

    // Preparo i dati per il server (resto uguale)
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
      eventData.recurrenceRule = rruleString; // Usa la nuova logica
      console.log("Mobile - Dati attività:", eventData.activityDate, eventData.recurrenceRule);
    } else if (newEvent.type === "pomodoro") {
      eventData.pomodoro = newEvent.pomodoro.title || "";
      eventData.start = (newEvent.start || new Date()).toISOString();
      eventData.end = (newEvent.end || new Date(Date.now() + 25 * 60000)).toISOString();
      console.log("Mobile - Dati pomodoro:", eventData.pomodoro);
    } else {
      eventData.start = (newEvent.start || new Date()).toISOString();
      eventData.end = (newEvent.end || new Date(Date.now() + 3600000)).toISOString();
      eventData.recurrenceRule = rruleString; // Usa la nuova logica
      console.log("Mobile - Dati evento:", eventData.start, "-", eventData.end);
    }

    if (isEditing) eventData._id = newEvent.id;
    console.log("Mobile - Invio dati al server:", eventData);

    // Invio la richiesta al server (resto uguale)
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Mobile - Risposta server:", data);
        if (data.success) {
          console.log("Mobile - Evento salvato con successo!");
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