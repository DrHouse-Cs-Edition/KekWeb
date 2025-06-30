import React from 'react';
import { X, MapPin, Clock } from 'lucide-react';
import styles from './EventModal.module.css';

const EventModal = ({
  showEventModal,
  setShowEventModal,
  selectedEvent,
  setSelectedEvent,
  isEditing,
  handleSave,
  handleDelete,
}) => {
  // Se il modal non è aperto, non mostro niente
  if (!showEventModal) {
    return null;
  }

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
    let newStart = new Date(e.target.value);
    setSelectedEvent(prev => ({ ...prev, start: newStart }));
  };

  // Funzione per gestire il cambio della data di fine
  const handleEndChange = (e) => {
    let newEnd = new Date(e.target.value);
    setSelectedEvent(prev => ({ ...prev, end: newEnd }));
  };

  // Funzione per gestire il cambio della location
  const handleLocationChange = (e) => {
    setSelectedEvent(prev => ({ ...prev, location: e.target.value }));
  };

  // Funzione per gestire il cambio della descrizione
  const handleDescriptionChange = (e) => {
    setSelectedEvent(prev => ({ ...prev, desc: e.target.value }));
  };

  // Funzione per abilitare/disabilitare l'allarme
  const toggleAlarm = (e) => {
    let isChecked = e.target.checked;
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
    if (!date) return '';
    let d = new Date(date);
    // Correggo il fuso orario
    let correctedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return correctedDate.toISOString().slice(0, 16);
  };

  // Controllo se l'allarme è attivo
  let isAlarmEnabled = (selectedEvent?.alarm?.earlyness > 0) || (selectedEvent?.alarm?.repeat_times > 0);
  let shouldShowRepeatEvery = selectedEvent?.alarm?.repeat_times > 1;

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

          {/* Date di inizio e fine */}
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
              value={selectedEvent?.desc || ''}
              onChange={handleDescriptionChange}
              className={styles.textareaInput}
              rows="3"
              placeholder="Aggiungi una descrizione..."
            />
          </div>

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

              {/* Mostro le impostazioni dell'allarme solo se è attivato */}
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