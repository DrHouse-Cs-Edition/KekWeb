import React from 'react';
import { X, MapPin, Clock } from 'lucide-react'; // Assuming these are used or will be used
import styles from './EventModal.module.css'; // Import the CSS module

const EventModal = ({
  showEventModal,
  setShowEventModal,
  selectedEvent,
  setSelectedEvent,
  isEditing,
  handleSave, // Make sure to pass these from the parent
  handleDelete, // Make sure to pass these from the parent
}) => {
  if (!showEventModal) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <h3 className={styles.modalTitle}>
              {isEditing ? 'Edit Event' : 'New Event'}
            </h3>
            <button
              onClick={() => setShowEventModal(false)}
              className={`${styles.iconButton} ${styles.closeButton}`}
            >
              <X className={styles.iconSize} />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div>
            <label className={styles.label}>
              Event Type
            </label>
            <select
              value={selectedEvent?.type || 'event'}
              onChange={(e) => setSelectedEvent(prev => ({ ...prev, type: e.target.value }))}
              className={styles.selectInput}
            >
              <option value="event">Event</option>
              <option value="activity">Activity</option>
              <option value="pomodoro">Pomodoro</option>
            </select>
          </div>

          <div>
            <label className={styles.label}>
              Title
            </label>
            <input
              type="text"
              value={selectedEvent?.title || ''}
              onChange={(e) => setSelectedEvent(prev => ({ ...prev, title: e.target.value }))}
              className={styles.textInput}
              placeholder="Event title"
            />
          </div>

          <div className={styles.dateTimeGrid}>
            <div>
              <label className={styles.label}>
                Start
              </label>
              <input
                type="datetime-local"
                value={selectedEvent?.start ? new Date(selectedEvent.start.getTime() - selectedEvent.start.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                onChange={(e) => setSelectedEvent(prev => ({ ...prev, start: new Date(e.target.value) }))}
                className={styles.textInput}
              />
            </div>
            <div>
              <label className={styles.label}>
                End
              </label>
              <input
                type="datetime-local"
                value={selectedEvent?.end ? new Date(selectedEvent.end.getTime() - selectedEvent.end.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                onChange={(e) => setSelectedEvent(prev => ({ ...prev, end: new Date(e.target.value) }))}
                className={styles.textInput}
              />
            </div>
          </div>

          <div>
            <label className={styles.label}>
              Location
            </label>
            <input
              type="text"
              value={selectedEvent?.location || ''}
              onChange={(e) => setSelectedEvent(prev => ({ ...prev, location: e.target.value }))}
              className={styles.textInput}
              placeholder="Add location"
            />
          </div>

          <div>
            <label className={styles.label}>
              Description
            </label>
            <textarea
              value={selectedEvent?.description || ''}
              onChange={(e) => setSelectedEvent(prev => ({ ...prev, description: e.target.value }))}
              className={styles.textareaInput}
              rows="3"
              placeholder="Add description"
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          {isEditing && (
            <button
              onClick={handleDelete}
              className={`${styles.button} ${styles.deleteButton}`}
            >
              Delete
            </button>
          )}
          <button
            onClick={() => setShowEventModal(false)}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`${styles.button} ${styles.saveButton}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;