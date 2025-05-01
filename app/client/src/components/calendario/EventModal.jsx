// EventModal.jsx
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default function EventModal({
  isEditing,
  newEvent,
  setNewEvent,
  handleSaveEvent,
  handleDeleteEvent,
  setShowModal,
  resetForm,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <ModalHeader
          isEditing={isEditing}
          setShowModal={setShowModal}
          resetForm={resetForm}
        />
        <ModalBody newEvent={newEvent} setNewEvent={setNewEvent} />
        <ModalFooter
          isEditing={isEditing}
          handleSaveEvent={handleSaveEvent}
          handleDeleteEvent={handleDeleteEvent}
          setShowModal={setShowModal}
          resetForm={resetForm}
        />
      </div>
    </div>
  );
}

const ModalHeader = ({ isEditing, setShowModal, resetForm }) => (
  <div className="modal-header">
    <h3>{isEditing ? "Edit Event" : "New Event"}</h3>
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

const ModalBody = ({ newEvent, setNewEvent }) => (
    <div className="modal-body">
      <div className="form-group">
        <label>Event Type</label>
        <select
          value={newEvent.type || 'event'}
          onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
        >
          <option value="event">Regular Event</option>
          <option value="activity">Activity</option>
          <option value="pomodoro">Pomodoro</option>
        </select>
      </div>
  
      {newEvent.type === 'pomodoro' ? (
        <FormField
          label="Cycles Left"
          type="number"
          value={newEvent.cyclesLeft || ''}
          onChange={(e) => setNewEvent({ ...newEvent, cyclesLeft: e.target.value })}
          required
        />
      ) : (
        <>
          <FormField
            label="Title *"
            type="text"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            required
          />
  
          {newEvent.type === 'activity' ? (
            <FormField
              label="Activity Date"
              type="date"
              value={format(newEvent.activityDate || new Date(), "yyyy-MM-dd")}
              onChange={(e) => setNewEvent({ ...newEvent, activityDate: new Date(e.target.value) })}
            />
          ) : (
            <>
              <FormField
                label="Start Date"
                type="datetime-local"
                value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm", { locale: it })}
                onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
              />
  
              <FormField
                label="End Date"
                type="datetime-local"
                value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm", { locale: it })}
                onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
              />
            </>
          )}
  
          <FormField
            label="Location"
            type="text"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
          />
        </>
      )}
  
      {newEvent.type !== 'pomodoro' && (
        <FormField
          label="Description"
          isTextArea={true}
          value={newEvent.desc}
          onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value })}
        />
      )}
    </div>
  );

const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  isTextArea = false,
}) => (
  <div className="form-group">
    <label>{label}</label>
    {isTextArea ? (
      <textarea
        value={value}
        onChange={onChange}
        minHeight="80px"
        resize="vertical"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
      />
    )}
  </div>
);

const ModalFooter = ({
  isEditing,
  handleSaveEvent,
  handleDeleteEvent,
  setShowModal,
  resetForm,
}) => (
  <div className="modal-footer">
    {isEditing && (
      <button 
        className="delete-btn" 
        onClick={() => {
          if (window.confirm('Are you sure you want to delete this event?')) {
            handleDeleteEvent();
          }
        }}
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
    >
      Cancel
    </button>
    <button className="save-btn" onClick={handleSaveEvent}>
      {isEditing ? "Save Changes" : "Create Event"}
    </button>
  </div>
);
