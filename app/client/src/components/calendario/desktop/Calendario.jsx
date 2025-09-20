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
  const [currentDate, setCurrentDate] = useState(new Date()); // Mese che sto visualizzando
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
          console.log("Eventi caricati dal server:", data.list);
          setEvents(data.list);
        } else {
          console.log("Nessun evento trovato");
        }
      })
      .catch((err) => {
        console.error("Errore nel caricamento eventi:", err);
        alert("Errore nel caricamento degli eventi");
      });
  };

  // Funzione per ottenere gli eventi di una specifica data
  const getEventsForDate = (date) => {
    const eventsForDay = [];
    
    events.forEach(event => {
      if (!event.recurrenceRule) {
        // Eventi non ricorrenti - gestione normale
        let eventDate;
        if (event.type === "activity") {
          eventDate = new Date(event.activityDate);
        } else {
          eventDate = new Date(event.start);
        }
        
        if (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        ) {
          eventsForDay.push(event);
        }
      } else {
        // Eventi ricorrenti - gestione con UTC
        try {
          const rrule = RRule.fromString(event.recurrenceRule);
          
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
            console.log(`Controllo evento "${event.title}" per ${date.toDateString()}:`);
            console.log("- Data target UTC:", targetDateUTC.toISOString());
            console.log("- Range UTC:", startOfDayUTC.toISOString(), "->", endOfDayUTC.toISOString());
            console.log("- Occorrenze trovate:", occurrences.length);
            console.log("- RRule originale:", event.recurrenceRule);
          }
          
          if (occurrences.length > 0) {
            // Crea l'evento virtuale per questa occorrenza
            const virtualEvent = {
              ...event,
              isRecurringInstance: true,
              originalId: event._id,
            };
            
            if (event.type === "activity") {
              // Per le attività, usa la data locale
              virtualEvent.activityDate = new Date(
                date.getFullYear(), 
                date.getMonth(), 
                date.getDate()
              ).toISOString();
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
              ).toISOString();
              
              virtualEvent.end = new Date(
                date.getFullYear(), 
                date.getMonth(), 
                date.getDate(),
                originalEnd.getHours(), 
                originalEnd.getMinutes()
              ).toISOString();
            }
            
            eventsForDay.push(virtualEvent);
          }
        } catch (error) {
          console.error("Error processing recurring event:", error);
          console.error("Evento problematico:", event);
        }
      }
    });
    
    return eventsForDay;
  };

  // Funzione per gestire il click su una data (creare evento)
  const handleDateClick = (date) => {
    console.log("Data cliccata:", date);
    
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
    console.log("Evento cliccato:", event.title);
    
    // Estraggo la ricorrenza se c'è
    let recurrence = "";
    if (event.recurrenceRule) {
      let freqMatch = event.recurrenceRule.match(/FREQ=([A-Z]+)/);
      if (freqMatch && freqMatch[1]) {
        recurrence = freqMatch[1].toLowerCase();
      }
    }

    // For recurring instances, use the clicked date; otherwise use original date
    let startDate, endDate;
    
    if (event.isRecurringInstance && clickedDate) {
      // This is a recurring instance
      if (event.type === "activity") {
        startDate = clickedDate;
        endDate = clickedDate;
      } else {
        // Preserve the original time but use the clicked date
        const originalStart = new Date(event.start);
        const originalEnd = new Date(event.end);
        startDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(),
                            originalStart.getHours(), originalStart.getMinutes());
        endDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(),
                          originalEnd.getHours(), originalEnd.getMinutes());
      }
    } else {
      // Regular event or original recurring event
      startDate = event.start ? new Date(event.start) : new Date();
      endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 3600000);
    }
    
    let eventData = {
      id: event._id,
      title: event.title || "",
      type: event.type || "event",
      location: event.location || "",
      recurrenceRule: recurrence,
      description: event.description || "",
      alarm: event.alarm || {
        earlyness: 15,
        repeat_times: 1,
        repeat_every: 0
      }
    };
    
    switch(eventData.type) {
      case "activity":
        eventData.activityDate = event.isRecurringInstance && clickedDate ? 
          clickedDate : 
          (event.activityDate ? new Date(event.activityDate) : startDate);
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

  // Navigazione mesi
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(serverDate));
  };

  // Genera i giorni del mese
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primo giorno del mese e ultimo giorno del mese
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Quanti giorni del mese precedente mostrare
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Lunedì come primo giorno
    
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
          
          // Crea la data senza problemi di timezone
          let rruleDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          
          if (newEvent.type === "event") {
            // Per gli eventi, mantieni l'ora originale
            rruleDate.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
          }
          
          // FIX: Per le ricorrenze settimanali, specifica il giorno della settimana
          let rruleOptions = {
            freq: freq,
            dtstart: rruleDate
          };
          
          // Se è settimanale, aggiungi il giorno specifico
          if (newEvent.recurrenceRule === 'weekly') {
            // RRule usa: MO=0, TU=1, WE=2, TH=3, FR=4, SA=5, SU=6
            // JavaScript usa: Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6
            
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
            console.log("Giorno JS:", jsDay, "Giorno RRule:", rruleDay, "Data:", rruleDate.toString());
          }
          
          let rruleObj = new RRule(rruleOptions);
          rruleString = rruleObj.toString();
          console.log("RRule creata:", rruleString);
          
          // Debug: verifica le prime occorrenze
          const testOccurrences = rruleObj.between(
            new Date(rruleDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 settimana prima
            new Date(rruleDate.getTime() + 14 * 24 * 60 * 60 * 1000)  // 2 settimane dopo
          );
          console.log("Prime occorrenze generate:", testOccurrences.map(d => d.toString()));
          
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
        // Keep it simple - just use the date without complex timezone manipulation
        eventData.activityDate = activityDate.toISOString();
        eventData.recurrenceRule = rruleString;
        break;
      case "pomodoro":
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

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  const dayNames = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  return (
    <div className={styles.calendarContainer}>
      {/* Header del calendario */}
      <div className={styles.calendarHeader}>
        <div className={styles.navigationControls}>
          <button onClick={goToPreviousMonth} className={styles.navButton}>
            ◀
          </button>
          <button onClick={goToToday} className={styles.todayButton}>
            Oggi
          </button>
          <button onClick={goToNextMonth} className={styles.navButton}>
            ▶
          </button>
        </div>
        
        <h2 className={styles.monthTitle}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
      </div>

      {/* Griglia del calendario */}
      <div className={styles.calendarGrid}>
        {/* Header giorni della settimana */}
        {dayNames.map(day => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}
        
        {/* Giorni del mese */}
        {generateCalendarDays().map((day, index) => (
          <div
            key={index}
            className={`${styles.dayCell} ${
              !day.isCurrentMonth ? styles.otherMonth : ''
            } ${day.isToday ? styles.today : ''}`}
            onClick={() => handleDateClick(day.date)}
          >
            <div className={styles.dayNumber}>
              {day.date.getDate()}
            </div>
            
            {/* Eventi del giorno */}
            <div className={styles.dayEvents}>
              {day.events.slice(0, 3).map((event, eventIndex) => (
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
              {day.events.length > 3 && (
                <div className={styles.moreEvents}>
                  +{day.events.length - 3} altri
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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