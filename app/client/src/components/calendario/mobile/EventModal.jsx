import React from 'react';
import { X, MapPin, Clock } from 'lucide-react';
import styles from './EventModal.module.css';
import { SelectPomodoros } from '../desktop/EventModal';
import { Link } from "react-router-dom";

const EventModal = ({
  showEventModal,
  setShowEventModal,
  selectedEvent,  //newEvent del desktop
  setSelectedEvent, //setNewEvent del desktop
  isEditing,
  handleSave,
  handleDelete,
}) => {
  // Se il modal non è aperto, non mostro niente
  if (!showEventModal) {
    return null;
  }

  const handleInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    console.log("Campo cambiato:", name, "=", value);
    setSelectedEvent(prev => ({ ...prev, [name]: value }));
  };

  // Funzione per gestire la chiusura del modal
  const closeModal = () => {
    setShowEventModal(false);
  };

  // Funzione per gestire il cambio del tipo di evento
  const handleTypeChange = (e) => {
    let newType = e.target.value;
    setSelectedEvent(prev => ({ ...prev, type: newType }));
  };

  // Funzione per gestire il cambio del titolo
  const handleTitleChange = (e) => {
    setSelectedEvent(prev => ({ ...prev, title: e.target.value }));
  };

  // Funzione per gestire il cambio della data di inizio
  const handleStartChange = (e) => {
    let value = e.target.value;
    
    // Controllo se il valore è vuoto o non valido
    if (!value || value === "") {
      console.log("Data inizio vuota, uso data corrente");
      setSelectedEvent(prev => ({ ...prev, start: new Date() }));
      return;
    }
    
    // Controllo se la data è valida
    let newStart = new Date(value);
    if (isNaN(newStart.getTime())) {
      console.log("Data inizio non valida, uso data corrente");
      setSelectedEvent(prev => ({ ...prev, start: new Date() }));
      return;
    }
    
    setSelectedEvent(prev => ({ ...prev, start: newStart }));
  };

  // Funzione per gestire il cambio della data di fine
  const handleEndChange = (e) => {
    let value = e.target.value;
    
    // Controllo se il valore è vuoto o non valido
    if (!value || value === "") {
      console.log("Data fine vuota, uso data corrente + 1 ora");
      setSelectedEvent(prev => ({ ...prev, end: new Date(Date.now() + 3600000) }));
      return;
    }
    
    // Controllo se la data è valida
    let newEnd = new Date(value);
    if (isNaN(newEnd.getTime())) {
      console.log("Data fine non valida, uso data corrente + 1 ora");
      setSelectedEvent(prev => ({ ...prev, end: new Date(Date.now() + 3600000) }));
      return;
    }
    
    setSelectedEvent(prev => ({ ...prev, end: newEnd }));
  };

  // Funzione per gestire il cambio della data dell'attività
  const handleActivityDateChange = (e) => {
    let value = e.target.value;
    
    // Controllo se il valore è vuoto o non valido
    if (!value || value === "") {
      console.log("Data attività vuota, uso data corrente");
      setSelectedEvent(prev => ({ ...prev, activityDate: new Date() }));
      return;
    }
    
    // Controllo se la data è valida
    let newActivityDate = new Date(value);
    if (isNaN(newActivityDate.getTime())) {
      console.log("Data attività non valida, uso data corrente");
      setSelectedEvent(prev => ({ ...prev, activityDate: new Date() }));
      return;
    }
    
    setSelectedEvent(prev => ({ ...prev, activityDate: newActivityDate }));
  };

  // Funzione per gestire il cambio della location
  const handleLocationChange = (e) => {
    setSelectedEvent(prev => ({ ...prev, location: e.target.value }));
  };

  // Funzione per gestire il cambio della descrizione
  const handleDescriptionChange = (e) => {
    setSelectedEvent(prev => ({ ...prev, description: e.target.value }));
  };

  // Funzione per abilitare/disabilitare l'allarme
  const toggleAlarm = (e) => {
    let isChecked = e.target.checked;
    
    // Per le attività, gestisci solo il campo enabled
    if (selectedEvent?.type === "activity") {
      setSelectedEvent(prev => ({
        ...prev,
        alarm: {
          ...prev.alarm,
          enabled: isChecked
        }
      }));
    } else {
      // Per eventi e pomodoro, mantieni la logica esistente
      if (isChecked) {
        // Attivo l'allarme con valori predefiniti
        setSelectedEvent(prev => ({
          ...prev,
          alarm: {
            ...prev.alarm,
            earlyness: 15,
            repeat_times: 1
          }
        }));
      } else {
        // Disattivo l'allarme
        setSelectedEvent(prev => ({
          ...prev,
          alarm: {
            ...prev.alarm,
            earlyness: 0,
            repeat_times: 0,
            repeat_every: 0
          }
        }));
      }
    }
  };

  // Funzione per cambiare quando suonare l'allarme
  const handleEarlynessChange = (e) => {
    let minutes = parseInt(e.target.value);
    setSelectedEvent(prev => ({
      ...prev,
      alarm: {
        ...prev.alarm,
        earlyness: minutes
      }
    }));
  };

  // Funzione per cambiare quante volte ripetere l'allarme
  const handleRepeatTimesChange = (e) => {
    let times = parseInt(e.target.value);
    setSelectedEvent(prev => ({
      ...prev,
      alarm: {
        ...prev.alarm,
        repeat_times: times
      }
    }));
  };

  // Funzione per cambiare ogni quanto ripetere l'allarme
  const handleRepeatEveryChange = (e) => {
    let minutes = parseInt(e.target.value);
    setSelectedEvent(prev => ({
      ...prev,
      alarm: {
        ...prev.alarm,
        repeat_every: minutes
      }
    }));
  };

  // Funzione per formattare la data per l'input datetime-local
  const formatDateForInput = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return '';
    let d = new Date(date);
    // Correggo il fuso orario
    let correctedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return correctedDate.toISOString().slice(0, 16);
  };

  // Funzione per formattare la data per l'input date
  const formatDateOnlyForInput = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return '';
    let d = new Date(date);
    return d.toISOString().slice(0, 10);
  };

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

  // Controllo se l'allarme è attivo
  let isAlarmEnabled = selectedEvent?.type === "activity" 
    ? selectedEvent?.alarm?.enabled 
    : (selectedEvent?.alarm?.earlyness > 0) || (selectedEvent?.alarm?.repeat_times > 0);
  let shouldShowRepeatEvery = selectedEvent?.alarm?.repeat_times > 1;

  // Aggiungi questa funzione per gestire il cambio di ricorrenza
  const handleRecurrenceChange = (e) => {
    let value = e.target.value;
    console.log("Nuova ricorrenza selezionata:", value);
    setSelectedEvent(prev => ({ ...prev, recurrenceRule: value }));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header del modal */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <h3 className={styles.modalTitle}>
              {isEditing ? 'Modifica Evento' : 'Nuovo Evento'}
            </h3>
            <button
              onClick={closeModal}
              className={`${styles.iconButton} ${styles.closeButton}`}
            >
              <X className={styles.iconSize} />
            </button>
          </div>
        </div>

        {/* Corpo del modal */}
        <div className={styles.modalBody}>
          {/* Tipo di evento */}
          <div>
            <label className={styles.label}>
              Tipo di Evento
            </label>
            <select
              value={selectedEvent?.type || 'event'}
              onChange={handleTypeChange}
              className={styles.selectInput}
            >
              <option value="event">Evento</option>
              <option value="activity">Attività</option>
              <option value="pomodoro">Pomodoro</option>
            </select>
          </div>

          {/* Campi condizionali - nascosti per pomodoro */}
          {selectedEvent?.type !== "pomodoro" && (
            <>
              {/* Titolo */}
              <div>
                <label className={styles.label}>
                  Titolo
                </label>
                <input
                  type="text"
                  value={selectedEvent?.title || ''}
                  onChange={handleTitleChange}
                  className={styles.textInput}
                  placeholder="Inserisci il titolo dell'evento"
                />
              </div>

              {/* Date di inizio e fine - diverse per attività vs eventi */}
              {selectedEvent?.type === "activity" ? (
                // Attività: solo la data senza ora
                <div>
                  <label className={styles.label}>
                    Data Attività
                  </label>
                  <input
                    type="date"
                    value={formatDateOnlyForInput(selectedEvent?.activityDate)}
                    onChange={handleActivityDateChange}
                    className={styles.textInput}
                  />
                </div>
              ) : (
                // Eventi normali: data e ora di inizio e fine
                <div className={styles.dateTimeGrid}>
                  <div>
                    <label className={styles.label}>
                      Inizio
                    </label>
                    <input
                      type="datetime-local"
                      value={formatDateForInput(selectedEvent?.start)}
                      onChange={handleStartChange}
                      className={styles.textInput}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>
                      Fine
                    </label>
                    <input
                      type="datetime-local"
                      value={formatDateForInput(selectedEvent?.end)}
                      onChange={handleEndChange}
                      className={styles.textInput}
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <label className={styles.label}>
                  Luogo
                </label>
                <input
                  type="text"
                  value={selectedEvent?.location || ''}
                  onChange={handleLocationChange}
                  className={styles.textInput}
                  placeholder="Dove si svolge l'evento?"
                />
              </div>

              {/* Descrizione */}
              <div>
                <label className={styles.label}>
                  Descrizione
                </label>
                <textarea
                  value={selectedEvent?.description || ''}
                  onChange={handleDescriptionChange}
                  className={styles.textareaInput}
                  rows="3"
                  placeholder="Aggiungi una descrizione..."
                />
              </div>

              {/* RICORRENZA - solo per eventi normali, NON per attività */}
              {selectedEvent?.type === "event" && (
                <div>
                  <label className={styles.label}>
                    Ricorrenza
                  </label>
                  <select
                    value={selectedEvent?.recurrenceRule || ""}
                    onChange={handleRecurrenceChange}
                    className={styles.selectInput}
                  >
                    <option value="">Nessuna ricorrenza</option>
                    <option value="daily">Ogni giorno</option>
                    <option value="weekly">Ogni settimana</option>
                    <option value="monthly">Ogni mese</option>
                    <option value="yearly">Ogni anno</option>
                  </select>
                </div>
              )}
            </>
          )}

          {/* Campi specifici per pomodoro */}
          {selectedEvent?.type === "pomodoro" && (
            <div className={styles.pomodoroSection}>
              <div className={styles.pomodoroMessage}>
                <p>Seleziona un template pomodoro per creare la sessione di studio.</p>
              </div>
              
              <SelectPomodoros newEvent={selectedEvent} setNewEvent={setSelectedEvent} />
              
              {selectedEvent.pomodoro?.studyTime && (
                <FormField
                  id="studyTime"
                  name="studyTime"
                  label="Tempo di Studio (min)"
                  type="number"
                  value={selectedEvent.pomodoro.studyTime || 0}
                  onChange={handleInputChange}
                  disabled={true}
                />
              )}
              {selectedEvent.pomodoro?.breakTime && (
                <FormField
                  id="breakTime"
                  name="breakTime"
                  label="Tempo di Pausa (min)"
                  type="number"
                  value={selectedEvent.pomodoro.breakTime || 0}
                  onChange={handleInputChange}
                  disabled={true}
                />
              )}
              {selectedEvent.pomodoro?.cycles && (
                <FormField
                  id="cycles"
                  name="cycles"
                  label="Numero di Cicli"
                  type="number"
                  value={selectedEvent.pomodoro.cycles || 0}
                  onChange={handleInputChange}
                  disabled={true}
                  min="1"
                />
              )}
              
              <Link to={"/pomodoro"} state={selectedEvent?.pomodoro} className={styles.linkButton}>
                Vai al Pomodoro
              </Link>
            </div>
          )}

          {/* Impostazioni allarme (solo se non è un pomodoro) */}
          {selectedEvent?.type !== "pomodoro" && (
            <div className={styles.alarmGroup}>
              <div className={styles.alarmCheckbox}>
                <input
                  type="checkbox"
                  id="enable-alarm-mobile"
                  checked={isAlarmEnabled}
                  onChange={toggleAlarm}
                />
                <label htmlFor="enable-alarm-mobile" className={styles.checkboxLabel}>
                  Attiva Allarme
                </label>
              </div>

              {/* Mostro le impostazioni dell'allarme solo se è attivato e NON per le attività */}
              {isAlarmEnabled && selectedEvent?.type !== "activity" && (
                <div className={styles.alarmSettings}>
                  <div>
                    <label className={styles.label}>
                      Avvisami (minuti prima)
                    </label>
                    <select
                      value={selectedEvent?.alarm?.earlyness || 15}
                      onChange={handleEarlynessChange}
                      className={styles.selectInput}
                    >
                      <option value="0">All'orario dell'evento</option>
                      <option value="5">5 minuti prima</option>
                      <option value="15">15 minuti prima</option>
                      <option value="30">30 minuti prima</option>
                      <option value="60">1 ora prima</option>
                      <option value="1440">1 giorno prima</option>
                    </select>
                  </div>

                  <div>
                    <label className={styles.label}>
                      Ripeti allarme (volte)
                    </label>
                    <select
                      value={selectedEvent?.alarm?.repeat_times || 1}
                      onChange={handleRepeatTimesChange}
                      className={styles.selectInput}
                    >
                      <option value="1">Una volta</option>
                      <option value="2">2 volte</option>
                      <option value="3">3 volte</option>
                      <option value="5">5 volte</option>
                    </select>
                  </div>

                  {/* Mostro questo campo solo se voglio ripetere più di una volta */}
                  {shouldShowRepeatEvery && (
                    <div>
                      <label className={styles.label}>
                        Ripeti ogni (minuti)
                      </label>
                      <select
                        value={selectedEvent?.alarm?.repeat_every || 0}
                        onChange={handleRepeatEveryChange}
                        className={styles.selectInput}
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
          )}
        </div>

        {/* Footer del modal con i bottoni */}
        <div className={styles.modalFooter}>
          {/* Bottone di eliminazione (solo se sto modificando) */}
          {isEditing && (
            <button
              onClick={handleDelete}
              className={`${styles.button} ${styles.deleteButton}`}
            >
              Elimina
            </button>
          )}
          
          {/* Bottone di annullamento */}
          <button
            onClick={closeModal}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Annulla
          </button>
          
          {/* Bottone di salvataggio */}
          <button
            onClick={handleSave}
            className={`${styles.button} ${styles.saveButton}`}
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;