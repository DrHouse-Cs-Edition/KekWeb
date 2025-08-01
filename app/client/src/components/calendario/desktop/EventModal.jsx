import { preventDefault } from "@fullcalendar/core/internal";
import styles from "./Calendario.module.css";  
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";

// Modal per creare o modificare eventi
const EventModal = function EventModal({
  isEditing, // Se sto modificando o creando
  newEvent, // I dati dell'evento
  setNewEvent, // Per cambiare i dati dell'evento
  handleSaveEvent, // Funzione per salvare
  handleDeleteEvent, // Funzione per eliminare
  setShowModal, // Per chiudere il modal
  resetForm, // Per pulire il form
  isLoading // Se sta caricando
}) {
  const [recurrence, setRecurrence] = useState(newEvent.recurrenceRule || "");

  // Quando cambia l'evento, aggiorno anche la ricorrenza
  useEffect(() => {
    console.log("Aggiorno ricorrenza:", newEvent.recurrenceRule);
    setRecurrence(newEvent.recurrenceRule || "");
  }, [newEvent.recurrenceRule]);

  // Quando cambio la ricorrenza nel dropdown
  const handleRecurrenceChange = (e) => {
    let value = e.target.value;
    console.log("Nuova ricorrenza selezionata:", value);
    setRecurrence(value); // Aggiorno lo stato locale
    setNewEvent(prev => ({ ...prev, recurrenceRule: value })); // E anche l'evento
  };

  // Per chiudere il modal con il tasto Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        console.log("Chiudo modal con Escape");
        setShowModal(false);
        resetForm();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    // Cleanup per evitare memory leak
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [setShowModal, resetForm]);

  // Chiudo il modal se clicco fuori
  const handleOutsideClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      console.log("Chiudo modal cliccando fuori");
      setShowModal(false);
      resetForm();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOutsideClick}>
      <div className={styles.modal}>
        {/* Header del modal */}
        <ModalHeader isEditing={isEditing} setShowModal={setShowModal} resetForm={resetForm} />
        
        {/* Corpo del modal con tutti i campi */}
        <ModalBody 
          newEvent={newEvent} 
          setNewEvent={setNewEvent} 
          recurrence={recurrence} 
          handleRecurrenceChange={handleRecurrenceChange} 
        />
        
        {/* Footer con i bottoni */}
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

// Header del modal con titolo e X per chiudere
const ModalHeader = ({ isEditing, setShowModal, resetForm }) => (
  <div className={styles.modalHeader}>
    <h3>
      {isEditing ? "Modifica Evento" : "Nuovo Evento"}
    </h3>
    <button
      onClick={() => {
        console.log("Chiudo modal dal bottone X");
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
  // Quando cambio un campo di testo normale
  const handleInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    console.log("Campo cambiato:", name, "=", value);
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  // Quando cambio una data
  const handleDateChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    console.log("Data cambiata:", name, "=", value);
    setNewEvent(prev => ({ ...prev, [name]: new Date(value) }));
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

      {/* Campi diversi in base al tipo */}
      {newEvent.type === "pomodoro" ? (
        <>
        <SelectPomodoros newEvent = {newEvent} setNewEvent = {setNewEvent}></SelectPomodoros>
        <FormField
          id="studyTime"
          name="studyTime"
          label="studyTime"
          type="number"
          value={newEvent.pomodoro.studyTime || 0}
          onChange={handleInputChange}
          required
        />
        <FormField
          id="breakTime"
          name="breakTime"
          label="breakTime"
          type="number"
          value={newEvent.pomodoro.breakTime || 0}
          onChange={handleInputChange}
          required
        />
        <FormField
          id="cycles"
          name="cycles"
          label="cycles"
          type="number"
          value={newEvent.pomodoro.cycles || 0}
          onChange={handleInputChange}
          min="1"
          required
        />

        <Link to={"/pomodoro"} state={newEvent?.pomodoro}>Pahim leso</Link>     
        </> 
      ) : (
        // Per eventi normali e attività
        <>
          {/* Titolo obbligatorio */}
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
            // Attività: solo la data senza ora
            <FormField
              id="activity-date"
              name="activityDate"
              label="Data Attività"
              type="date"
              value={format(newEvent.activityDate || new Date(), "yyyy-MM-dd")}
              onChange={handleDateChange}
            />
          ) : (
            // Eventi normali: data e ora di inizio e fine
            <>
              <FormField
                id="start-date"
                name="start"
                label="Data Inizio"
                type="datetime-local"
                value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm", { locale: it })}
                onChange={handleDateChange}
              />
              <FormField
                id="end-date"
                name="end"
                label="Data Fine"
                type="datetime-local"
                value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm", { locale: it })}
                onChange={handleDateChange}
              />
            </>
          )}

          {/* Luogo */}
          <FormField
            id="event-location"
            name="location"
            label="Luogo"
            type="text"
            value={newEvent.location}
            onChange={handleInputChange}
          />

          {/* Ricorrenza (solo per eventi normali e attività) */}
          {(newEvent.type === "event" || newEvent.type === "activity") && (
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

      {/* Descrizione e allarme (non per i pomodoro) */}
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
          
          {/* Impostazioni allarme */}
          <AlarmSettings 
            alarm={newEvent.alarm}
            setNewEvent={setNewEvent}
          />
        </>
      )}
    </div>
  );
};

// Componente per un singolo campo del form
const FormField = ({ id, name, label, type, value, onChange, ...rest }) => (
  <div className={styles.formGroup}>
    <label htmlFor={id}>{label}</label>
    {type === "textarea" ? (
      <textarea id={id} name={name} value={value} onChange={onChange} {...rest} />
    ) : (
      <input type={type} id={id} name={name} value={value} onChange={onChange} {...rest} />
    )}
  </div>
);

// Componente per gestire le impostazioni dell'allarme
const AlarmSettings = ({ alarm, setNewEvent }) => {
  // Quando cambio un'impostazione dell'allarme
  const handleAlarmChange = (field, value) => {
    console.log("Cambio allarme:", field, "=", value);
    setNewEvent(prev => ({
      ...prev,
      alarm: {
        ...prev.alarm,
        [field]: value
      }
    }));
  };

  // Controllo se l'allarme è abilitato
  let isAlarmEnabled = alarm.earlyness > 0 || alarm.repeat_times > 0;
  console.log("Allarme abilitato:", isAlarmEnabled);

  return (
    <div className={styles.notificationGroup}>
      {/* Checkbox per abilitare/disabilitare allarme */}
      <div className={styles.notificationCheckbox}>
        <input
          type="checkbox"
          id="enable-alarm"
          checked={isAlarmEnabled}
          onChange={(e) => {
            if (e.target.checked) {
              console.log("Abilito allarme con valori default");
              handleAlarmChange('earlyness', 15);
              handleAlarmChange('repeat_times', 1);
            } else {
              console.log("Disabilito allarme");
              handleAlarmChange('earlyness', 0);
              handleAlarmChange('repeat_times', 0);
              handleAlarmChange('repeat_every', 0);
            }
          }}
        />
        <label htmlFor="enable-alarm">Abilita Allarme</label>
      </div>
      
      {/* Impostazioni dettagliate solo se l'allarme è abilitato */}
      {isAlarmEnabled && (
        <div className={styles.notificationSubSettings}>
          {/* Quando suonare l'allarme */}
          <div className={styles.formGroup}>
            <label htmlFor="alarm-earlyness">Avvisami (minuti prima)</label>
            <select
              id="alarm-earlyness"
              value={alarm.earlyness}
              onChange={(e) => handleAlarmChange('earlyness', parseInt(e.target.value))}
            >
              <option value="0">All'orario dell'evento</option>
              <option value="5">5 minuti prima</option>
              <option value="15">15 minuti prima</option>
              <option value="30">30 minuti prima</option>
              <option value="60">1 ora prima</option>
              <option value="1440">1 giorno prima</option>
            </select>
          </div>

          {/* Quante volte ripetere */}
          <div className={styles.formGroup}>
            <label htmlFor="alarm-repeat-times">Ripeti allarme (volte)</label>
            <select
              id="alarm-repeat-times"
              value={alarm.repeat_times}
              onChange={(e) => handleAlarmChange('repeat_times', parseInt(e.target.value))}
            >
              <option value="1">Una volta</option>
              <option value="2">2 volte</option>
              <option value="3">3 volte</option>
              <option value="5">5 volte</option>
            </select>
          </div>

          {/* Ogni quanto ripetere (solo se > 1 volta) */}
          {alarm.repeat_times > 1 && (
            <div className={styles.formGroup}>
              <label htmlFor="alarm-repeat-every">Ripeti ogni (minuti)</label>
              <select
                id="alarm-repeat-every"
                value={alarm.repeat_every}
                onChange={(e) => handleAlarmChange('repeat_every', parseInt(e.target.value))}
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

// Footer del modal con i bottoni di azione
const ModalFooter = ({
  isEditing,
  handleSaveEvent,
  handleDeleteEvent,
  setShowModal,
  resetForm,
  isLoading
}) => (
  <div className={styles.modalFooter}>
    {/* Bottone elimina (solo se sto modificando) */}
    {isEditing && (
      <button 
        type="button" 
        className={styles.deleteBtn} 
        onClick={() => {
          console.log("Clicco su elimina");
          handleDeleteEvent();
        }} 
        disabled={isLoading}
      >
        {isLoading ? 'Eliminando...' : 'Elimina'}
      </button>
    )}
    
    {/* Bottone annulla */}
    <button 
      type="button" 
      className={styles.cancelBtn} 
      onClick={() => { 
        console.log("Clicco su annulla");
        setShowModal(false); 
        resetForm(); 
      }} 
      disabled={isLoading}
    >
      Annulla
    </button>
    
    {/* Bottone salva */}
    <button 
      type="button" 
      className={styles.saveBtn} 
      onClick={() => {
        console.log("Clicco su salva");
        handleSaveEvent();
      }} 
      disabled={isLoading}
    >
      {isLoading ? 'Salvando...' : 'Salva'}
    </button>
  </div>
);

export default EventModal;


const SelectPomodoros = ( {newEvent, setNewEvent} )=>{

const [pomodoroOptions, setPomodoroOptions] = useState([]);
const [currentPomodoro, setCurrentPomodoro] = useState(null);
const selectRef = useRef();

const FetchPomodoros = useCallback(()=>{
console.log("lezzo gaming");
fetch("api/Pomodoro/getP", {
  method:"GET",
  mode:"cors",
  headers:{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
  }
  })
  .then(res => res.json()
  ).then(
    (data) =>{
      setPomodoroOptions(data.body)
      if(newEvent.pomodoro)
      {
        console.log("newEvent.pomodoro reached")
        const initialPomodoro = data.body.find(p => p.title === newEvent.pomodoro);
        if(initialPomodoro)
          setNewEvent( prev => ({ ...prev, pomodoro: initialPomodoro }));
      }}
    )}, [pomodoroOptions, setNewEvent])

  // Gestore per il cambio dell'opzione selezionata
  const handleSelectChange = useCallback(e => {
    const selectedTitle = e.target.value;
    //ritorna se si è passati al valore base
    if(selectedTitle == "")
      return;
    // Trova l'oggetto pomodoro corrispondente all'ID selezionato
    const foundPomodoro = pomodoroOptions.find(p => p.title === selectedTitle);
    setCurrentPomodoro(foundPomodoro); // Aggiorna lo stato con l'intero oggetto
    console.log("Selected Pomodoro Object:", foundPomodoro);
    setNewEvent( prev => ({ ...prev, pomodoro: foundPomodoro }));

  }, [pomodoroOptions]); // Dipende da pomodoroOptions per trovare l'oggetto

useEffect(()=>{
  FetchPomodoros();
  console.log("recievend new event pomodoro: ", newEvent.pomodoro);
},[]);

  return(
    <select
    ref={selectRef}
    onChange={handleSelectChange}
    value={
    typeof newEvent.pomodoro === 'string'
      ? newEvent.pomodoro // If it's a string (initial state)
      : newEvent.pomodoro?.title || "" // If it's an object or null/undefined
    } >
      <option value="">
        select a pomodoro
      </option>
      {pomodoroOptions.map(el =>(
        <option value={el.title} key={el.title} {...newEvent?.pomodoro?.title === el.title ? "selected" : ""}>
          {el.title}
        </option>
      ))}
    </select>
  )
}