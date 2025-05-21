// EventModal.jsx
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useState, useEffect, useCallback, memo } from "react";

// Memoized component for better performance
const EventModal = memo(function EventModal({
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

  // Update recurrence state when newEvent changes (important for editing events)
  useEffect(() => {
    setRecurrence(newEvent.recurrenceRule || "");
  }, [newEvent.recurrenceRule]);

  const handleRecurrenceChange = useCallback((e) => {
    const value = e.target.value;
    setRecurrence(value);
    setNewEvent(prev => ({ ...prev, recurrenceRule: value }));
  }, [setNewEvent]);

  // Handle escape key to close modal
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

  // Handle click outside modal to close it
  const handleOutsideClick = useCallback((e) => {
    if (e.target.className === 'modal-overlay') {
      setShowModal(false);
      resetForm();
    }
  }, [setShowModal, resetForm]);

  return (
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <ModalHeader
          isEditing={isEditing}
          setShowModal={setShowModal}
          resetForm={resetForm}
        />
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
});

const ModalHeader = memo(({ isEditing, setShowModal, resetForm }) => (
  <div className="modal-header">
    <h3 id="modal-title">{isEditing ? "Edit Event" : "New Event"}</h3>
    <button
      onClick={() => {
        setShowModal(false);
        resetForm();
      }}
      aria-label="Close modal"
    >
      ×
    </button>
  </div>
));

const ModalBody = memo(({
  newEvent,
  setNewEvent,
  recurrence,
  handleRecurrenceChange,
}) => {
  // Handle form field changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  }, [setNewEvent]);

  // Handle date field changes
  const handleDateChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: new Date(value) }));
  }, [setNewEvent]);

  return (
    <div className="modal-body">
      <div className="form-group">
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

      {newEvent.type === "pomodoro" ? (
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
        <>
          <FormField
            id="event-title"
            name="title"
            label="Title *"
            type="text"
            value={newEvent.title}
            onChange={handleInputChange}
            required
          />

          {newEvent.type === "activity" ? (
            <FormField
              id="activity-date"
              name="activityDate"
              label="Activity Date"
              type="date"
              value={format(newEvent.activityDate || new Date(), "yyyy-MM-dd")}
              onChange={handleDateChange}
            />
          ) : (
            <>
              <FormField
                id="start-date"
                name="start"
                label="Start Date"
                type="datetime-local"
                value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm", {
                  locale: it,
                })}
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

          <FormField
            id="event-location"
            name="location"
            label="Location"
            type="text"
            value={newEvent.location}
            onChange={handleInputChange}
          />

          {(newEvent.type === "event" || newEvent.type === "activity") && (
            <div className="form-group">
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
          name="desc"
          label="Description"
          isTextArea={true}
          value={newEvent.desc}
          onChange={handleInputChange}
        />
      )}
    </div>
  );
});

const FormField = memo(({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  isTextArea = false,
  min,
  max,
}) => (
  <div className="form-group">
    <label htmlFor={id}>{label}</label>
    {isTextArea ? (
      <textarea
        id={id}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
      />
    ) : (
      <input
        id={id}
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
      />
    )}
  </div>
));

const ModalFooter = memo(({
  isEditing,
  handleSaveEvent,
  handleDeleteEvent,
  setShowModal,
  resetForm,
  isLoading
}) => (
  <div className="modal-footer">
    {isEditing && (
      <button
        className="delete-btn"
        onClick={handleDeleteEvent}
        disabled={isLoading}
      >
        Delete
      </button>
    )}
    <button
      className="cancel-btn"
      onClick={() => {
        setShowModal(false);
        resetForm();
      }}
      disabled={isLoading}
    >
      Cancel
    </button>
    <button 
      className="save-btn" 
      onClick={handleSaveEvent}
      disabled={isLoading}
    >
      {isLoading ? "Saving..." : (isEditing ? "Save Changes" : "Create Event")}
    </button>
  </div>
));

export default EventModal;