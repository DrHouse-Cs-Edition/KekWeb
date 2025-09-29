import React from 'react';
import { X, MapPin, Clock } from 'lucide-react';
import styles from './EventModal.module.css';
import { SelectPomodoros } from '../desktop/EventModal';
import { Link } from "react-router-dom";

const EventModal = ({
  showEventModal,
  setShowEventModal,
  selectedEvent,  // newEvent del desktop
  setSelectedEvent, // setNewEvent del desktop
  isEditing,
  handleSave,
  handleDelete,
}) => {
  if (!showEventModal) {
    return null;
  }

  const handleInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setSelectedEvent(prev => ({ ...prev, [name]: value }));
  };

  const closeModal = () => {
    setShowEventModal(false);
  };

  const handleTypeChange = (e) => {
    let newType = e.target.value;
    setSelectedEvent(prev => ({ ...prev, type: newType }));
  };

  const handleTitleChange = (e) => {
    setSelectedEvent(prev => ({ ...prev, title: e.target.value }));
  };

  const handleStartChange = (e) => {
    let value = e.target.value;
    
    if (!value || value === "") {
      setSelectedEvent(prev => ({ ...prev, start: new Date() }));
      return;
    }
    
    let newStart = new Date(value);
    if (isNaN(newStart.getTime())) {
      setSelectedEvent(prev => ({ ...prev, start: new Date() }));
      return;
    }
    
    setSelectedEvent(prev => ({ ...prev, start: newStart }));
  };

  const handleEndChange = (e) => {
    let value = e.target.value;
    
    if (!value || value === "") {
      setSelectedEvent(prev => ({ ...prev, end: new Date(Date.now() + 3600000) }));
      return;
    }
    
    let newEnd = new Date(value);
    if (isNaN(newEnd.getTime())) {
      setSelectedEvent(prev => ({ ...prev, end: new Date(Date.now() + 3600000) }));
      return;
    }
    
    setSelectedEvent(prev => ({ ...prev, end: newEnd }));
  };

  const handleActivityDateChange = (e) => {
    let value = e.target.value;
    
    if (!value || value === "") {
      setSelectedEvent(prev => ({ ...prev, activityDate: new Date() }));
      return;
    }
    
    let newActivityDate = new Date(value);
    if (isNaN(newActivityDate.getTime())) {
      setSelectedEvent(prev => ({ ...prev, activityDate: new Date() }));
      return;
    }
    
    setSelectedEvent(prev => ({ ...prev, activityDate: newActivityDate }));
  };

  const handleLocationChange = (e) => {
    setSelectedEvent(prev => ({ ...prev, location: e.target.value }));
  };

  const handleDescriptionChange = (e) => {
    setSelectedEvent(prev => ({ ...prev, description: e.target.value }));
  };

  // Gestisce l'attivazione/disattivazione dell'allarme
  const toggleAlarm = (e) => {
    const enabled = e.target.checked;
    if (enabled) {
      // Enable alarm with default values
      setSelectedEvent(prev => ({
        ...prev,
        alarm: {
          earlyness: 15,
          repeat_times: 1,
          repeat_every: 0,
          enabled: true
        }
      }));
    } else {
      // Disable alarm by setting all values to 0
      setSelectedEvent(prev => ({
        ...prev,
        alarm: {
          earlyness: 0,
          repeat_times: 0,
          repeat_every: 0,
          enabled: false
        }
      }));
    }
  };

  const handleEarlynessChange = (e) => {
    const value = parseInt(e.target.value) || 15;
    setSelectedEvent(prev => ({
      ...prev,
      alarm: {
        ...prev.alarm,
        earlyness: value
      }
    }));
  };

  const handleRepeatTimesChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setSelectedEvent(prev => ({
      ...prev,
      alarm: {
        ...prev.alarm,
        repeat_times: value
      }
    }));
  };

  const handleRepeatEveryChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setSelectedEvent(prev => ({
      ...prev,
      alarm: {
        ...prev.alarm,
        repeat_every: value
      }
    }));
  };

  // Formatta la data per l'input datetime-local
  const formatDateForInput = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return '';
    let d = new Date(date);
    let correctedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return correctedDate.toISOString().slice(0, 16);
  };

  // Formatta la data per l'input date
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

  // FIX: Cambia la logica per controllare correttamente il campo enabled
  let isAlarmEnabled = selectedEvent?.alarm?.enabled === true || (selectedEvent?.alarm?.earlyness > 0);
  let shouldShowRepeatEvery = selectedEvent?.alarm?.repeat_times > 1;

  const handleRecurrenceChange = (e) => {
    let value = e.target.value;
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

          {/* Campi nascosti per pomodoro */}
          {selectedEvent?.type !== "pomodoro" && (
            <>
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

              {/* Date diverse per attività vs eventi */}
              {selectedEvent?.type === "activity" ? (
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

              {/* Ricorrenza solo per eventi normali */}
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

          {/* Sezione pomodoro */}
          {selectedEvent?.type === "pomodoro" && (
            <div className={styles.pomodoroSection}>
              <div className={styles.pomodoroMessage}>
                <p>Seleziona un template pomodoro per creare la sessione di studio.</p>
              </div>
              
              <SelectPomodoros newEvent={selectedEvent} setSelectedEvent={setSelectedEvent} />
              
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

          {/* Impostazioni allarme */}
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

              {/* Impostazioni avanzate dell'allarme */}
              {isAlarmEnabled && (
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

                  {/* Campo mostrato solo per ripetizioni multiple */}
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

        {/* Footer con bottoni azione */}
        <div className={styles.modalFooter}>
          {isEditing && (
            <button
              onClick={handleDelete}
              className={`${styles.button} ${styles.deleteButton}`}
            >
              Elimina
            </button>
          )}
          
          <button
            onClick={closeModal}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Annulla
          </button>
          
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