import styles from "./EventModal.module.css";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { Link } from "react-router-dom";

// Modal per creare o modificare eventi
const EventModal = function EventModal({
  isEditing,
  newEvent,
  setNewEvent,
  handleSaveEvent,
  handleDeleteEvent,
  setShowModal,
  resetForm,
  isLoading
}) {
  const [recurrence, setRecurrence] = useState(newEvent.recurrenceRule || "");

  // Quando cambia l'evento, aggiorno anche la ricorrenza
  useEffect(() => {
    setRecurrence(newEvent.recurrenceRule || "");
  }, [newEvent.recurrenceRule]);

  // Quando cambio la ricorrenza nel dropdown
  const handleRecurrenceChange = (e) => {
    let value = e.target.value;
    setRecurrence(value);
    setNewEvent(prev => ({ ...prev, recurrenceRule: value }));
  };

  // Calcola la data di fine mantenendo la durata originale
  const calculateEndDate = (eventData, clickedDate) => {
    if (!eventData.start || !eventData.end) {
      return new Date(new Date(clickedDate).getTime() + 60 * 60 * 1000);
    }
    
    const originalStart = new Date(eventData.start);
    const originalEnd = new Date(eventData.end);
    const duration = originalEnd.getTime() - originalStart.getTime();
    
    return new Date(new Date(clickedDate).getTime() + duration);
  };

  // Chiude il modal con il tasto Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        resetForm();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [setShowModal, resetForm]);

  // Chiude il modal se clicco fuori
  const handleOutsideClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      setShowModal(false);
      resetForm();
    }
  };

  // Gestore per gli eventi ricorrenti
  const handleRecurringEvent = (eventData, clickedDate) => {
    if (eventData.recurrenceRule && clickedDate) {
      return {
        ...eventData,
        start: clickedDate,
        end: calculateEndDate(eventData, clickedDate),
        isRecurringInstance: true,
        originalEventId: eventData._id
      };
    }
    return eventData;
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOutsideClick}>
      <div className={styles.modal}>
        <ModalHeader isEditing={isEditing} setShowModal={setShowModal} resetForm={resetForm} />
        
        <ModalBody 
          newEvent={newEvent} 
          setNewEvent={setNewEvent} 
          recurrence={recurrence} 
          handleRecurrenceChange={handleRecurrenceChange} 
        />
        
        <ModalFooter 
          isEditing={isEditing} 
          handleSaveEvent={handleSaveEvent} 
          handleDeleteEvent={handleDeleteEvent} 
          setShowModal={setShowModal} 
          resetForm={resetForm} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};

// Header del modal con titolo e pulsante chiusura
const ModalHeader = ({ isEditing, setShowModal, resetForm }) => (
  <div className={styles.modalHeader}>
    <h3>
      {isEditing ? "Modifica Evento" : "Nuovo Evento"}
    </h3>
    <button
      onClick={() => {
        setShowModal(false);
        resetForm();
      }}
    >
      ×
    </button>
  </div>
);

// Corpo del modal con tutti i campi del form
const ModalBody = ({
  newEvent,
  setNewEvent,
  recurrence,
  handleRecurrenceChange,
}) => {
  // Gestisce i cambi dei campi di testo
  const handleInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  // Gestisce i cambi delle date
  const handleDateChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    
    if (!value || value === "") {
      setNewEvent(prev => ({ ...prev, [name]: new Date() }));
      return;
    }
    
    const dateValue = new Date(value);
    if (isNaN(dateValue.getTime())) {
      setNewEvent(prev => ({ ...prev, [name]: new Date() }));
      return;
    }
    
    setNewEvent(prev => ({ ...prev, [name]: dateValue }));
  };

  return (
    <div className={styles.modalBody}>
      {/* Tipo di evento */}
      <div className={styles.formGroup}>
        <label htmlFor="event-type">Tipo Evento</label>
        <select
          id="event-type"
          name="type"
          value={newEvent.type || "event"}
          onChange={handleInputChange}
        >
          <option value="event">Evento Normale</option>
          <option value="activity">Attività</option>
          <option value="pomodoro">Pomodoro</option>
        </select>
      </div>

      {/* Campi diversi per tipo pomodoro */}
      {newEvent.type === "pomodoro" ? (
        <>
        <SelectPomodoros newEvent={newEvent} setNewEvent={setNewEvent} />
        {newEvent.pomodoro.studyTime && <FormField
          id="studyTime"
          name="studyTime"
          label="Tempo Studio (min)"
          type="number"
          value={newEvent.pomodoro.studyTime || 0}
          onChange={handleInputChange}
          disabled={true}
          required
        />}
        {newEvent.pomodoro.breakTime && <FormField
          id="breakTime"
          name="breakTime"
          label="Tempo Pausa (min)"
          type="number"
          value={newEvent.pomodoro.breakTime || 0}
          onChange={handleInputChange}
          disabled={true}
          required
        />}
        {newEvent.pomodoro.cycles && <FormField
          id="cycles"
          name="cycles"
          label="Cicli"
          type="number"
          value={newEvent.pomodoro.cycles || 0}
          onChange={handleInputChange}
          disabled={true}
          min="1"
          required
        />}
        <br />
        <Link to={"/pomodoro"} state={newEvent?.pomodoro} className={styles.linkButton}>
          Vai a Pomodoro
        </Link>     
        </> 
      ) : (
        // Per eventi normali e attività
        <>
          <FormField
            id="event-title"
            name="title"
            label="Titolo *"
            type="text"
            value={newEvent.title}
            onChange={handleInputChange}
            required
          />

          {/* Date diverse per attività vs eventi */}
          {newEvent.type === "activity" ? (
            <FormField
              id="activity-date"
              name="activityDate"
              label="Data Attività"
              type="date"
              value={newEvent.activityDate && !isNaN(new Date(newEvent.activityDate).getTime()) 
                ? format(new Date(newEvent.activityDate), "yyyy-MM-dd") 
                : format(new Date(), "yyyy-MM-dd")}
              onChange={handleDateChange}
            />
          ) : (
            <>
              <FormField
                id="start-date"
                name="start"
                label="Data Inizio"
                type="datetime-local"
                value={newEvent.start && !isNaN(new Date(newEvent.start).getTime()) 
                  ? format(new Date(newEvent.start), "yyyy-MM-dd'T'HH:mm", { locale: it })
                  : format(new Date(), "yyyy-MM-dd'T'HH:mm", { locale: it })}
                onChange={handleDateChange}
              />
              <FormField
                id="end-date"
                name="end"
                label="Data Fine"
                type="datetime-local"
                value={newEvent.end && !isNaN(new Date(newEvent.end).getTime()) 
                  ? format(new Date(newEvent.end), "yyyy-MM-dd'T'HH:mm", { locale: it })
                  : format(new Date(), "yyyy-MM-dd'T'HH:mm", { locale: it })}
                onChange={handleDateChange}
              />
            </>
          )}

          <FormField
            id="event-location"
            name="location"
            label="Luogo"
            type="text"
            value={newEvent.location}
            onChange={handleInputChange}
          />

          {/* Ricorrenza solo per eventi normali */}
          {newEvent.type === "event" && (
            <div className={styles.formGroup}>
              <label htmlFor="recurrence">Ricorrenza</label>
              <select 
                id="recurrence" 
                value={recurrence} 
                onChange={handleRecurrenceChange}
              >
                <option value="">Nessuna</option>
                <option value="daily">Giornaliera</option>
                <option value="weekly">Settimanale</option>
                <option value="monthly">Mensile</option>
                <option value="yearly">Annuale</option>
              </select>
            </div>
          )}
        </>
      )}

      {/* Descrizione e allarme per eventi normali e attività */}
      {newEvent.type !== "pomodoro" && (
        <>
          <FormField
            id="event-description"
            name="description"
            label="Descrizione"
            type="textarea"
            value={newEvent.description}
            onChange={handleInputChange}
          />
          
          <AlarmSettings 
            alarm={newEvent.alarm}
            setNewEvent={setNewEvent}
            eventType={newEvent.type}
          />
        </>
      )}
    </div>
  );
};

// Componente per un singolo campo del form
const FormField = ({ id, name, label, type, value, onChange, disabled = false, ...rest }) => (
  <div className={styles.formGroup}>
    <label htmlFor={id}>{label}</label>
    {type === "textarea" ? (
      <textarea id={id} name={name} value={value} onChange={onChange} disabled={disabled} {...rest} />
    ) : (
      <input type={type} id={id} name={name} value={value} onChange={onChange} disabled={disabled} {...rest} />
    )}
  </div>
);

// Componente per gestire le impostazioni dell'allarme
const AlarmSettings = ({ alarm, setNewEvent, eventType }) => {
  const handleAlarmToggle = (enabled) => {
    setNewEvent(prev => ({
      ...prev,
      alarm: {
        ...prev.alarm,
        enabled: enabled
      }
    }));
  };

  const handleAlarmChange = (field, value) => {
    setNewEvent(prev => ({
      ...prev,
      alarm: {
        ...prev.alarm,
        [field]: parseInt(value) || 0
      }
    }));
  };

  const isAlarmEnabled = alarm?.enabled === true || alarm?.enabled === "true";

  return (
    <div className={styles.notificationGroup}>
      <div className={styles.notificationCheckbox}>
        <input
          type="checkbox"
          id="enable-alarm"
          checked={isAlarmEnabled}
          onChange={(e) => handleAlarmToggle(e.target.checked)}
        />
        <label htmlFor="enable-alarm">Abilita Notifiche</label>
      </div>
      
      {/* Impostazioni avanzate solo se allarme abilitato e non è un'attività */}
      {isAlarmEnabled && eventType !== "activity" && (
        <div className={styles.notificationSubSettings}>
          <div className={styles.formGroup}>
            <label htmlFor="alarm-earlyness">Avvisami (minuti prima)</label>
            <select
              id="alarm-earlyness"
              value={alarm?.earlyness || 15}
              onChange={(e) => handleAlarmChange('earlyness', e.target.value)}
            >
              <option value="0">All'orario dell'evento</option>
              <option value="5">5 minuti prima</option>
              <option value="15">15 minuti prima</option>
              <option value="30">30 minuti prima</option>
              <option value="60">1 ora prima</option>
              <option value="1440">1 giorno prima</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="alarm-repeat-times">Ripeti allarme (volte)</label>
            <select
              id="alarm-repeat-times"
              value={alarm?.repeat_times || 1}
              onChange={(e) => handleAlarmChange('repeat_times', e.target.value)}
            >
              <option value="1">Una volta</option>
              <option value="2">2 volte</option>
              <option value="3">3 volte</option>
              <option value="5">5 volte</option>
            </select>
          </div>

          {(alarm?.repeat_times || 1) > 1 && (
            <div className={styles.formGroup}>
              <label htmlFor="alarm-repeat-every">Ripeti ogni (minuti)</label>
              <select
                id="alarm-repeat-every"
                value={alarm?.repeat_every || 1}
                onChange={(e) => handleAlarmChange('repeat_every', e.target.value)}
              >
                <option value="1">1 minuto</option>
                <option value="2">2 minuti</option>
                <option value="5">5 minuti</option>
                <option value="10">10 minuti</option>
                <option value="15">15 minuti</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Footer del modal con i pulsanti di azione
const ModalFooter = ({
  isEditing,
  handleSaveEvent,
  handleDeleteEvent,
  setShowModal,
  resetForm,
  isLoading
}) => (
  <div className={styles.modalFooter}>
    {isEditing && (
      <button 
        type="button" 
        className={styles.deleteBtn} 
        onClick={() => {
          handleDeleteEvent();
        }} 
        disabled={isLoading}
      >
        {isLoading ? 'Eliminando...' : 'Elimina'}
      </button>
    )}
    
    <button 
      type="button" 
      className={styles.cancelBtn} 
      onClick={() => { 
        setShowModal(false); 
        resetForm(); 
      }} 
      disabled={isLoading}
    >
      Annulla
    </button>
    
    <button 
      type="button" 
      className={styles.saveBtn} 
      onClick={() => {
        handleSaveEvent();
      }} 
      disabled={isLoading}
    >
      {isLoading ? 'Salvando...' : 'Salva'}
    </button>
  </div>
);

export default EventModal;

/**
 * Componente per la selezione dei pomodori
 * @param {Object} newEvent - Evento corrente
 * @param {Function} setNewEvent - Funzione per aggiornare l'evento
 * @returns Select per la scelta del pomodoro
 */
const SelectPomodoros = ({ newEvent, setNewEvent }) => {
  const [pomodoroOptions, setPomodoroOptions] = useState([]);
  const selectRef = useRef();

  // Carica la lista dei pomodori dal server
  const FetchPomodoros = useCallback(() => {
    fetch("api/Pomodoro/getP", {
      method: "GET",
      mode: "cors",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    })
    .then(res => res.json())
    .then((data) => {
      setPomodoroOptions(data.body);
      if (newEvent.pomodoro) {
        const initialPomodoro = data.body.find(p => p.title === newEvent.pomodoro);
        if (initialPomodoro) {
          setNewEvent(prev => ({ ...prev, pomodoro: initialPomodoro }));
        }
      }
    });
  }, [pomodoroOptions, setNewEvent]);

  // Gestisce il cambio dell'opzione selezionata
  const handleSelectChange = useCallback(e => {
    const selectedTitle = e.target.value;
    if (selectedTitle == "") return;
    
    const foundPomodoro = pomodoroOptions.find(p => p.title === selectedTitle);
    setNewEvent(prev => ({ ...prev, pomodoro: foundPomodoro }));
  }, [pomodoroOptions]);

  useEffect(() => {
    FetchPomodoros();
  }, []);

  return (
    <select
      className={styles.selectTitle}
      ref={selectRef}
      onChange={handleSelectChange}
      value={
        typeof newEvent.pomodoro === 'string'
          ? newEvent.pomodoro
          : newEvent.pomodoro?.title || ""
      }
    >
      <option value="" className={styles.initialOption}>
        Seleziona un pomodoro
      </option>
      {pomodoroOptions.map(el => (
        <option value={el.title} key={el.title}>
          {el.title}
        </option>
      ))}
    </select>
  );
};

export { SelectPomodoros };