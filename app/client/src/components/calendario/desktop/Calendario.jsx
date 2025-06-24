import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import itLocale from "@fullcalendar/core/locales/it";
import CalendarView from "./CalendarView";
import EventModal from "./EventModal";
import { RRule } from "rrule";
import styles from "./Calendario.module.css";

export default function CalendarApp() {
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
    description: "",
  });

  // HOOK useEffect - Si esegue quando il componente si monta
  useEffect(() => {
    getAllEvents(); // Carica tutti gli eventi dal backend all'avvio
  }, []);

  // FUNZIONE getAllEvents - Recupera tutti gli eventi dal backend
  const getAllEvents = () => {
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include", // Invia i cookie per l'autenticazione
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Converte gli eventi dal formato backend al formato FullCalendar
          const eventsForCalendar = data.list.map((event) => {
            // Crea l'oggetto base per FullCalendar
            let eventForFC = {
              id: event._id,
              title: event.title,
              extendedProps: { // Proprietà personalizzate per FullCalendar
                type: event.type,
                cyclesLeft: event.cyclesLeft,
                location: event.location,
                recurrenceRule: event.recurrenceRule,
                description: event.description,
              },
            };

            // Gestisce diversi tipi di eventi con logiche specifiche
            if (event.type === "activity") {
              // Attività: usa activityDate e può essere ricorrente
              let actDate = event.activityDate ? new Date(event.activityDate) : new Date();
              eventForFC.start = actDate;
              eventForFC.end = actDate;
              eventForFC.allDay = true;
              eventForFC.backgroundColor = "#4285F4";
              eventForFC.extendedProps.activityDate = actDate;
                
              // Se ha una regola di ricorrenza la aggiungo
              if (event.recurrenceRule && event.recurrenceRule.includes('FREQ=')) {
                try {
                  let freqPattern = event.recurrenceRule.match(/FREQ=([A-Z]+)/);
                  if (freqPattern && freqPattern[1]) {
                    eventForFC.rrule = {
                      freq: freqPattern[1].toLowerCase(),
                      dtstart: actDate.toISOString()
                    };
                    console.log("Creata rrule per attività:", eventForFC.rrule);
                  }
                } catch (err) {
                  console.error("Errore nel parsing della ricorrenza per attività:", err);
                }
              }
            } else if (event.type === "pomodoro") {
              // Per i pomodoro
              eventForFC.start = event.start ? new Date(event.start) : new Date();
              eventForFC.end = event.end ? new Date(event.end) : new Date(eventForFC.start.getTime() + 25 * 60000);
              eventForFC.backgroundColor = "#EA4335";
            } else {
              // Per gli eventi normali
              eventForFC.start = event.start ? new Date(event.start) : new Date();
              eventForFC.end = event.end ? new Date(event.end) : new Date(eventForFC.start.getTime() + 3600000);
              eventForFC.backgroundColor = "#3174ad";
                
              // Gestisco la ricorrenza anche per gli eventi normali
              if (event.recurrenceRule && event.recurrenceRule.includes('FREQ=')) {
                try {
                  let freqPattern = event.recurrenceRule.match(/FREQ=([A-Z]+)/);
                  if (freqPattern && freqPattern[1]) {
                    eventForFC.rrule = {
                      freq: freqPattern[1].toLowerCase(),
                      dtstart: eventForFC.start.toISOString()
                    };
                    console.log("Creata rrule:", eventForFC.rrule);
                  }
                } catch (err) {
                  console.error("Errore nel parsing della ricorrenza:", err);
                }
              }
            }

            return eventForFC;
          });
          setEvents(eventsForCalendar); // Aggiorna lo stato con gli eventi convertiti
        }
      })
      .catch((err) => console.error("Errore nel fetch degli eventi:", err));
  };

  // Quando l'utente seleziona una data per creare un nuovo evento
  const onDateSelect = (selectInfo) => {
    setIsEditing(false); // Modalità creazione (non modifica)
    setNewEvent({
      ...newEvent,
      id: uuidv4(), // Genera un ID univoco
      start: selectInfo.start, // Data/ora di inizio selezionata
      end: selectInfo.end, // Data/ora di fine selezionata
      type: "event", // Tipo predefinito
      recurrenceRule: "",
      activityDate: selectInfo.start,
    });
    setShowModal(true); // Apre il modal per inserire i dettagli
    selectInfo.view.calendar.unselect(); // Deseleziona la data nel calendario
  };

  // Quando l'utente clicca su un evento esistente
  const onEventClick = (clickInfo) => {
    // Estraggo la ricorrenza se c'è
    let recurrence = "";
    if (clickInfo.event.extendedProps.recurrenceRule) {
      let freqMatch = clickInfo.event.extendedProps.recurrenceRule.match(/FREQ=([A-Z]+)/);
      if (freqMatch && freqMatch[1]) {
        recurrence = freqMatch[1].toLowerCase();
        console.log("Ricorrenza estratta:", recurrence);
      }
    }

    // Controllo che le date siano valide
    let startDate = clickInfo.event.start || new Date();
    let endDate = clickInfo.event.end || new Date(startDate.getTime() + 3600000);
    
    // Creo l'oggetto evento in base al tipo
    let eventData = {
      id: clickInfo.event.id,
      title: clickInfo.event.title || "",
      type: clickInfo.event.extendedProps.type || "event",
      location: clickInfo.event.extendedProps.location || "",
      recurrenceRule: recurrence,
      description: clickInfo.event.extendedProps.description || "",
    };
    
    // Aggiungo proprietà specifiche per tipo
    if (eventData.type === "activity") {
      eventData.activityDate = clickInfo.event.extendedProps.activityDate 
        ? new Date(clickInfo.event.extendedProps.activityDate) 
        : startDate;
    } else if (eventData.type === "pomodoro") {
      eventData.cyclesLeft = clickInfo.event.extendedProps.cyclesLeft || 0;
      eventData.start = startDate;
      eventData.end = endDate;
    } else {
      eventData.start = startDate;
      eventData.end = endDate;
    }
    
    setIsEditing(true); // Modalità modifica
    setNewEvent(eventData); // Popola il form con i dati esistenti
    setShowModal(true); // Apre il modal
  };

  // Salva l'evento (nuovo o modificato)
  const saveEvent = () => {
    // Validazione: controlla che ci sia un titolo (tranne per pomodoro)
    if (!newEvent.title && newEvent.type !== "pomodoro") {
      alert("Inserisci un titolo!");
      return;
    }

    // Determina URL e metodo HTTP in base se è modifica o creazione
    let url = isEditing
      ? `http://localhost:5000/api/events/update/${newEvent.id}`
      : "http://localhost:5000/api/events/save";
    let method = isEditing ? "PUT" : "POST";

    // Gestisce la ricorrenza convertendo il valore del form in RRule
    let rruleString = null;
    if ((newEvent.type === "event" || newEvent.type === "activity") && newEvent.recurrenceRule) {
      try {
        // Mappa le opzioni del dropdown alle costanti RRule
        let frequencyOptions = {
          'daily': RRule.DAILY,
          'weekly': RRule.WEEKLY,
          'monthly': RRule.MONTHLY,
          'yearly': RRule.YEARLY
        };
        
        let freq = frequencyOptions[newEvent.recurrenceRule];
        
        if (freq !== undefined) {
          let startDate = newEvent.type === "activity" 
            ? (newEvent.activityDate || new Date()) 
            : (newEvent.start || new Date());
          
          // Creo la stringa RRule
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
        console.error("Errore nella creazione della rrule:", error);
        alert("Errore nella ricorrenza");
        return;
      }
    }

    // Preparo i dati dell'evento per il backend
    let eventData = {
      title: newEvent.title || (newEvent.type === "pomodoro" ? "Sessione Pomodoro" : ""),
      description: newEvent.description || "",
      location: newEvent.location || "",
      type: newEvent.type,
      user: newEvent.user,
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
    
    console.log("Dati inviati al backend:", eventData);

    if (isEditing) eventData._id = newEvent.id;

    // Invio al backend
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          getAllEvents(); // ricarico gli eventi
          setShowModal(false); // Chiude il modal
          resetEventForm(); // Resetta il form
        } else {
          alert(result.message); // Mostra errore
        }
      })
      .catch((err) => console.error("Errore nel salvataggio:", err));
  };

  // Elimina evento
  const deleteEvent = () => {
    if (!window.confirm("Sei sicuro di voler eliminare questo evento?")) return;
    
    fetch(`http://localhost:5000/api/events/remove/${newEvent.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          getAllEvents(); // Ricarica la lista
          setShowModal(false); // Chiude il modal
          resetEventForm(); // Resetta il form
        } else {
          alert(result.message);
        }
      })
      .catch((err) => console.error("Errore nell'eliminazione:", err));
  };

  // FUNZIONE resetEventForm - Resetta il form ai valori predefiniti
  const resetEventForm = () => {
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
      description: "",
    });
    setIsEditing(false); // Torna in modalità creazione
  };

  return (
    <div className={styles.calendarContainer}>
      <CalendarView
        events={events}
        handleDateSelect={onDateSelect}
        handleEventClick={onEventClick}
        locale={itLocale}
      />

      {showModal && (
        <EventModal
          isEditing={isEditing}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          handleSaveEvent={saveEvent}
          handleDeleteEvent={deleteEvent}
          setShowModal={setShowModal}
          resetForm={resetEventForm}
        />
      )}
    </div>
  );
}