import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import itLocale from "@fullcalendar/core/locales/it";
import CalendarView from "./CalendarView";
import EventModal from "./EventModal";
import { RRule } from "rrule";
import styles from "./Calendario.module.css";

export default function CalendarApp() {
  // Stati per gestire il calendario
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [serverDate, setServerDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({ //*holds all data regarding a possible event
    id: "",
    title: "",
    type: "event",
    pomodoro: {     //serverside is just the Title, here is the whole object
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
        console.log("Server date updated:", currentServerDate);
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
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Funzione per caricare tutti gli eventi dal server
  const loadAllEvents = () => {
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include", // Serve per mandare i cookie
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Eventi caricati dal server:", data.list);
          
          // Trasformo gli eventi per FullCalendar
          let eventsForCalendar = data.list.map((event) => {
            console.log("Elaboro evento:", event.title, "tipo:", event.type);
            
            // Creo l'oggetto base
            let eventObj = {
              id: event._id,
              title: event.title,
              extendedProps: {
                type: event.type,
                pomodoro: event.pomodoro,
                location: event.location,
                recurrenceRule: event.recurrenceRule,
                description: event.description,
                alarm: event.alarm || {
                  earlyness: 15,
                  repeat_times: 1,
                  repeat_every: 0
                }
              },
            };
            
            // Gestisco i diversi tipi di eventi
            if (event.type === "activity") {
              // Per le attività uso activityDate
              let actDate = event.activityDate ? new Date(event.activityDate) : new Date();
              eventObj.start = actDate;
              eventObj.end = actDate;
              eventObj.allDay = true; // Le attività durano tutto il giorno
              eventObj.backgroundColor = "#4285F4"; // Blu per le attività
              eventObj.extendedProps.activityDate = actDate;
                
              // Se ha ricorrenza la aggiungo
              if (event.recurrenceRule && event.recurrenceRule.includes('FREQ=')) {
                try {
                  let freqMatch = event.recurrenceRule.match(/FREQ=([A-Z]+)/);
                  if (freqMatch && freqMatch[1]) {
                    eventObj.rrule = {
                      freq: freqMatch[1].toLowerCase(),
                      dtstart: actDate.toISOString()
                    };
                    console.log("Aggiunta ricorrenza all'attività:", eventObj.rrule);
                  }
                } catch (err) {
                  console.error("Errore ricorrenza attività:", err);
                }
              }
            } else if (event.type === "pomodoro") {
              // Per i pomodoro
              eventObj.start = event.start ? new Date(event.start) : new Date();
              eventObj.end = event.end ? new Date(event.end) : new Date(eventObj.start.getTime() + 25 * 60000); // 25 minuti
              eventObj.backgroundColor = "#EA4335"; // Rosso per i pomodoro
            } else {
              // Per gli eventi normali
              eventObj.start = event.start ? new Date(event.start) : new Date();
              eventObj.end = event.end ? new Date(event.end) : new Date(eventObj.start.getTime() + 3600000); // 1 ora
              eventObj.backgroundColor = "#3174ad"; // Blu scuro per eventi
                
              // Gestisco la ricorrenza anche per gli eventi normali
              if (event.recurrenceRule && event.recurrenceRule.includes('FREQ=')) {
                try {
                  let freqMatch = event.recurrenceRule.match(/FREQ=([A-Z]+)/);
                  if (freqMatch && freqMatch[1]) {
                    eventObj.rrule = {
                      freq: freqMatch[1].toLowerCase(),
                      dtstart: eventObj.start.toISOString()
                    };
                    console.log("Aggiunta ricorrenza all'evento:", eventObj.rrule);
                  }
                } catch (err) {
                  console.error("Errore ricorrenza evento:", err);
                }
              }
            }
            return eventObj;
          });
          
          setEvents(eventsForCalendar);
          console.log("Eventi pronti per il calendario:", eventsForCalendar.length);
        } else {
          console.log("Nessun evento trovato");
        }
      })
      .catch((err) => {
        console.error("Errore nel caricamento eventi:", err);
        alert("Errore nel caricamento degli eventi");
      });
  };

  // Quando clicco su una data per creare un nuovo evento
  const handleDateSelect = (selectInfo) => {
    console.log("Data selezionata:", selectInfo.start, "a", selectInfo.end);
    
    setIsEditing(false); // Sto creando, non modificando
    setNewEvent({
      ...newEvent,
      id: uuidv4(), // ID casuale
      start: selectInfo.start,
      end: selectInfo.end,
      type: "event", // Evento normale di default
      recurrenceRule: "",
      activityDate: selectInfo.start,
    });
    setShowModal(true); // Apro il modal
    selectInfo.view.calendar.unselect(); // Tolgo la selezione dal calendario
  };

  // Quando clicco su un evento esistente per modificarlo
  const handleEventClick = (clickInfo) => {
    console.log("Evento cliccato:", clickInfo.event.title);
    
    // Estraggo la ricorrenza se c'è
    let recurrence = "";
    if (clickInfo.event.extendedProps.recurrenceRule) {
      let freqMatch = clickInfo.event.extendedProps.recurrenceRule.match(/FREQ=([A-Z]+)/);
      if (freqMatch && freqMatch[1]) {
        recurrence = freqMatch[1].toLowerCase();
        console.log("Ricorrenza trovata:", recurrence);
      }
    }

    // Mi assicuro che le date siano valide
    let startDate = clickInfo.event.start || new Date();
    let endDate = clickInfo.event.end || new Date(startDate.getTime() + 3600000);
    
    // Preparo i dati dell'evento per il form
    let eventData = {
      id: clickInfo.event.id,
      title: clickInfo.event.title || "",
      type: clickInfo.event.extendedProps.type || "event",
      location: clickInfo.event.extendedProps.location || "",
      recurrenceRule: recurrence,
      description: clickInfo.event.extendedProps.description || "",
      alarm: clickInfo.event.extendedProps.alarm || {
        earlyness: 15,
        repeat_times: 1,
        repeat_every: 0
      }
    };
    
    // Add type-specific properties
    switch(eventData.type) {
      case "activity":
        eventData.activityDate = clickInfo.event.extendedProps.activityDate 
          ? new Date(clickInfo.event.extendedProps.activityDate) 
          : startDate;
        break;
      case "pomodoro":
        //load up a pomodoro Obj with: Title, studyTime, breakTime and cycles
        eventData.pomodoro = clickInfo.event.extendedProps.pomodoro || {
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
    
    setIsEditing(true); // Sto modificando
    setNewEvent(eventData); // Riempio il form
    setShowModal(true); // Apro il modal
  };

  // Funzione per salvare l'evento (nuovo o modificato)
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
        
        // Mappo le opzioni del dropdown
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
        eventData.activityDate = (newEvent.activityDate || new Date()).toISOString();
        eventData.recurrenceRule = rruleString; // Add recurrence rule to activities
        break;
      case "pomodoro":
        //serverside, pomodoro is just the title as ref to the schema
        eventData.pomodoro = newEvent.pomodoro.title || "";
        eventData.start = (newEvent.start || new Date()).toISOString();
        eventData.end = (newEvent.end || new Date(Date.now() + 25 * 60000)).toISOString();
        break;
      case "event":
      default:
        eventData.start = (newEvent.start || new Date()).toISOString();
        eventData.end = (newEvent.end || new Date(Date.now() + 3600000)).toISOString();
        eventData.recurrenceRule = rruleString;
        break;
    }
    
    if (isEditing) eventData._id = newEvent.id;
    console.log("Dati da inviare al server:", eventData);

    // Invio al server
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Risposta server:", result);
        if (result.success) {
          console.log("Evento salvato con successo!");
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
    
    console.log("Elimino evento:", newEvent.id);
    
    fetch(`http://localhost:5000/api/events/remove/${newEvent.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Risposta eliminazione:", result);
        if (result.success) {
          console.log("Evento eliminato!");
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

  return (
    <div className={styles.calendarContainer}>
      <CalendarView
        key={serverDate.toISOString()} // Forza re-render quando serverDate cambia
        events={events}
        handleDateSelect={handleDateSelect}
        handleEventClick={handleEventClick}
        locale={itLocale}
        serverDate={serverDate}
      />

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