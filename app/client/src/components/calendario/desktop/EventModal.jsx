import styles from "./Calendario.module.css"; // Import the CSS Module
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useState, useEffect, useCallback, memo } from "react";

// COMPONENTE PRINCIPALE EventModal - Modal per creare/modificare eventi
const EventModal = memo(function EventModal({
  isEditing, // true se stiamo modificando un evento esistente
  newEvent, // oggetto con i dati dell'evento
  setNewEvent, // funzione per aggiornare i dati dell'evento
  handleSaveEvent, // funzione per salvare l'evento
  handleDeleteEvent, // funzione per eliminare l'evento
  setShowModal, // funzione per chiudere il modal
  resetForm, // funzione per resettare il form
  isLoading // stato di caricamento
}) {
  const [recurrence, setRecurrence] = useState(newEvent.recurrenceRule || "");

  // HOOK useEffect - Aggiorna lo stato della ricorrenza quando cambia l'evento
  useEffect(() => {
    setRecurrence(newEvent.recurrenceRule || "");
  }, [newEvent.recurrenceRule]);

  // FUNZIONE handleRecurrenceChange - Gestisce il cambio della regola di ricorrenza
  const handleRecurrenceChange = useCallback((e) => {
    const value = e.target.value;
    setRecurrence(value); // Aggiorna stato locale
    setNewEvent(prev => ({ ...prev, recurrenceRule: value })); // Aggiorna evento
  }, [setNewEvent]);

  // HOOK useEffect - Gestisce il tasto Escape per chiudere il modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        resetForm();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey); // Cleanup
  }, [setShowModal, resetForm]);

  // FUNZIONE handleOutsideClick - Chiude il modal se si clicca fuori
  const handleOutsideClick = useCallback((e) => {
    if (e.target.className === 'modal-overlay') {
      setShowModal(false);
      resetForm();
    }
  }, [setShowModal, resetForm]);

  // Renderizza la struttura del modal con Header, Body e Footer
  return (
    <div className={styles.modalOverlay} onClick={handleOutsideClick}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <ModalHeader isEditing={isEditing} setShowModal={setShowModal} resetForm={resetForm} />
        <ModalBody newEvent={newEvent} setNewEvent={setNewEvent} recurrence={recurrence} handleRecurrenceChange={handleRecurrenceChange} />
        <ModalFooter isEditing={isEditing} handleSaveEvent={handleSaveEvent} handleDeleteEvent={handleDeleteEvent} setShowModal={setShowModal} resetForm={resetForm} isLoading={isLoading} />
      </div>
    </div>
  );
});

// COMPONENTE ModalHeader - Header del modal con titolo e pulsante chiudi
const ModalHeader = memo(({ isEditing, setShowModal, resetForm }) => (
  <div className={styles.modalHeader}>
    <h3 id="modal-title">
      {isEditing ? "Edit Event" : "New Event"} {/* Titolo dinamico */}
    </h3>
    <button
      onClick={() => {
        setShowModal(false); // Chiude il modal
        resetForm(); // Resetta il form
      }}
      aria-label="Close modal"
    >
      ×
    </button>
  </div>
));

// COMPONENTE ModalBody - Corpo del modal con tutti i campi del form
const ModalBody = memo(({
  newEvent,
  setNewEvent,
  recurrence,
  handleRecurrenceChange,
}) => {
  // FUNZIONE handleInputChange - Gestisce il cambio dei campi di testo
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value })); // Aggiorna il campo specifico
  }, [setNewEvent]);

  // FUNZIONE handleDateChange - Gestisce il cambio dei campi data
  const handleDateChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: new Date(value) })); // Converte in Date object
  }, [setNewEvent]);

  return (
    <div className={styles.modalBody}>
      {/* SELECT per il tipo di evento */}
      <div className={styles.formGroup}>
        <label htmlFor="event-type">Event Type</label>
        <select
          id="event-type"
          name="type"
          value={newEvent.type || "event"}
          onChange={handleInputChange}
        >
          <option value="event">Regular Event</option>
          <option value="activity">Activity</option>
          <option value="pomodoro">Pomodoro</option>
        </select>
      </div>

      {/* RENDERING CONDIZIONALE - Campi diversi in base al tipo di evento */}
      {newEvent.type === "pomodoro" ? (
        // Per eventi Pomodoro: solo cicli rimanenti
        <FormField
          id="cycles-left"
          name="cyclesLeft"
          label="Cycles Left"
          type="number"
          value={newEvent.cyclesLeft || ""}
          onChange={handleInputChange}
          min="1"
          required
        />
      ) : (
        // Per eventi normali e attività
        <>
          {/* Campo titolo obbligatorio */}
          <FormField
            id="event-title"
            name="title"
            label="Title *"
            type="text"
            value={newEvent.title}
            onChange={handleInputChange}
            required
          />

          {/* CAMPI DATA - Diversi per attività vs eventi normali */}
          {newEvent.type === "activity" ? (
            // Attività: solo data (senza ora)
            <FormField
              id="activity-date"
              name="activityDate"
              label="Activity Date"
              type="date"
              value={format(newEvent.activityDate || new Date(), "yyyy-MM-dd")}
              onChange={handleDateChange}
            />
          ) : (
            // Eventi normali: data e ora di inizio/fine
            <>
              <FormField
                id="start-date"
                name="start"
                label="Start Date"
                type="datetime-local"
                value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm", { locale: it })}
                onChange={handleDateChange}
              />
              <FormField
                id="end-date"
                name="end"
                label="End Date"
                type="datetime-local"
                value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm", { locale: it })}
                onChange={handleDateChange}
              />
            </>
          )}

          {/* Campo location */}
          <FormField
            id="event-location"
            name="location"
            label="Location"
            type="text"
            value={newEvent.location}
            onChange={handleInputChange}
          />

          {(newEvent.type === "event" || newEvent.type === "activity") && (
            <div className={styles.formGroup}>
              <label htmlFor="recurrence">Recurrence</label>
              <select 
                id="recurrence" 
                value={recurrence} 
                onChange={handleRecurrenceChange}
              >
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
        </>
      )}

      {newEvent.type !== "pomodoro" && (
        <FormField
          id="event-description"
          name="description"
          label="Description"
          type="textarea"
          value={newEvent.description}
          onChange={handleInputChange}
        />
      )}
    </div>
  );
});

const FormField = memo(({ id, name, label, type, value, onChange, ...rest }) => (
  <div className={styles.formGroup}>
    <label htmlFor={id}>{label}</label>
    {type === "textarea" ? (
      <textarea id={id} name={name} value={value} onChange={onChange} {...rest} />
    ) : (
      <input type={type} id={id} name={name} value={value} onChange={onChange} {...rest} />
    )}
  </div>
));

// COMPONENTE ModalFooter - Footer del modal con i pulsanti di azione
const ModalFooter = memo(({
  isEditing,
  handleSaveEvent,
  handleDeleteEvent,
  setShowModal,
  resetForm,
  isLoading
}) => (
  <div className={styles.modalFooter}>
    {isEditing && (
      <button type="button" className={styles.deleteBtn} onClick={handleDeleteEvent} disabled={isLoading}>
        {isLoading ? 'Deleting...' : 'Delete'}
      </button>
    )}
    <button type="button" className={styles.cancelBtn} onClick={() => { setShowModal(false); resetForm(); }} disabled={isLoading}>
      Cancel
    </button>
    <button type="button" className={styles.saveBtn} onClick={handleSaveEvent} disabled={isLoading}>
      {isLoading ? 'Saving...' : 'Save'}
    </button>
  </div>
));

export default EventModal;