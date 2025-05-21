import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import itLocale from "@fullcalendar/core/locales/it";
import CalendarView from "./CalendarView";
import EventModal from "./EventModal";
import { RRule } from "rrule";
import "./Calendario.css";
import { se } from "date-fns/locale";

export default function CalendarApp() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEvent, setNewEvent] = useState({
    id: "",
    title: "",
    type: "event",
    cyclesLeft: null,
    activityDate: null,
    start: new Date(),
    end: new Date(),
    location: "",
    recurrenceRule: "",
    desc: "",
  });

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = () => {
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          const formattedEvents = json.list.map((event) => {
            // Base event object
            const formattedEvent = {
              id: event._id,
              title: event.title,
              extendedProps: {
                type: event.type,
                cyclesLeft: event.cyclesLeft,
                location: event.location,
                recurrenceRule: event.recurrenceRule,
                desc: event.description,
              },
            };

            // Handle different event types differently
            switch (event.type) {
              case "activity":
                // For activities, use activityDate for both start and end
                const activityDate = event.activityDate ? new Date(event.activityDate) : new Date();
                formattedEvent.start = activityDate;
                formattedEvent.end = activityDate;
                formattedEvent.allDay = true; // Make activities appear as all-day events
                formattedEvent.backgroundColor = "#4285F4"; // Blue for activities
                formattedEvent.extendedProps.activityDate = activityDate;
                
                // Handle recurrence rule for activities too
                if (event.recurrenceRule && event.recurrenceRule.includes('FREQ=')) {
                  try {
                    const freqMatch = event.recurrenceRule.match(/FREQ=([A-Z]+)/);
                    if (freqMatch && freqMatch[1]) {
                      formattedEvent.rrule = {
                        freq: freqMatch[1].toLowerCase(),
                        dtstart: activityDate.toISOString()
                      };
                      console.log("Created rrule object for activity:", formattedEvent.rrule);
                    }
                  } catch (err) {
                    console.error("Error parsing recurrence rule for activity:", err);
                  }
                }
                break;
                
              case "pomodoro":
                // For pomodoro events, use start date or today if none
                formattedEvent.start = event.start ? new Date(event.start) : new Date();
                formattedEvent.end = event.end ? new Date(event.end) : new Date(formattedEvent.start.getTime() + 25 * 60000); // 25 minutes
                formattedEvent.backgroundColor = "#EA4335"; // Red for pomodoro
                break;
                
              case "event":
              default:
                // For regular events
                formattedEvent.start = event.start ? new Date(event.start) : new Date();
                formattedEvent.end = event.end ? new Date(event.end) : new Date(formattedEvent.start.getTime() + 3600000); // 1 hour
                formattedEvent.backgroundColor = "#3174ad"; // Default blue
                
                // Handle recurrence rule for FullCalendar
                if (event.recurrenceRule && event.recurrenceRule.includes('FREQ=')) {
                  try {
                    const freqMatch = event.recurrenceRule.match(/FREQ=([A-Z]+)/);
                    if (freqMatch && freqMatch[1]) {
                      formattedEvent.rrule = {
                        freq: freqMatch[1].toLowerCase(),
                        dtstart: formattedEvent.start.toISOString()
                      };
                      console.log("Created rrule object:", formattedEvent.rrule);
                    }
                  } catch (err) {
                    console.error("Error parsing recurrence rule:", err);
                  }
                }
                break;
            }

            return formattedEvent;
          });
          setEvents(formattedEvents);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleDateSelect = (selectInfo) => {
    setIsEditing(false);
    setNewEvent((prev) => ({
      ...prev,
      id: uuidv4(),
      start: selectInfo.start,
      end: selectInfo.end,
      type: "event", // Reset to event type when creating new
      recurrenceRule: "", // Reset recurrence rule
      activityDate: selectInfo.start, // Set activity date to start date
    }));
    setShowModal(true);
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = (clickInfo) => {
    // Extract recurrence pattern from the stored rule if it exists
    let recurrenceValue = "";
    if (clickInfo.event.extendedProps.recurrenceRule) {
      const freqMatch = clickInfo.event.extendedProps.recurrenceRule.match(/FREQ=([A-Z]+)/);
      if (freqMatch && freqMatch[1]) {
        recurrenceValue = freqMatch[1].toLowerCase();
        console.log("Extracted recurrence value:", recurrenceValue);
      }
    }

    // Make sure we have valid dates
    const start = clickInfo.event.start || new Date();
    const end = clickInfo.event.end || new Date(start.getTime() + 3600000); // Default to 1 hour later if no end
    
    // Create event object based on the event type
    const eventData = {
      id: clickInfo.event.id,
      title: clickInfo.event.title || "",
      type: clickInfo.event.extendedProps.type || "event",
      location: clickInfo.event.extendedProps.location || "",
      recurrenceRule: recurrenceValue,
      desc: clickInfo.event.extendedProps.desc || "",
    };
    
    // Add type-specific properties
    switch(eventData.type) {
      case "activity":
        eventData.activityDate = clickInfo.event.extendedProps.activityDate 
          ? new Date(clickInfo.event.extendedProps.activityDate) 
          : start;
        break;
      case "pomodoro":
        eventData.cyclesLeft = clickInfo.event.extendedProps.cyclesLeft || 0;
        eventData.start = start;
        eventData.end = end;
        break;
      case "event":
      default:
        eventData.start = start;
        eventData.end = end;
        break;
    }
    
    setIsEditing(true);
    setNewEvent(eventData);
    setShowModal(true);
  };

  const handleSaveEvent = () => {
    if (!newEvent.title && newEvent.type !== "pomodoro") return;

    const url = isEditing
      ? `http://localhost:5000/api/events/update/${newEvent.id}`
      : "http://localhost:5000/api/events/save";
    const method = isEditing ? "PUT" : "POST";

    let rruleString = null;
    if ((newEvent.type === "event" || newEvent.type === "activity") && newEvent.recurrenceRule) {
      try {
        // Map the dropdown values to RRule frequency constants
        const frequencyMap = {
          'daily': RRule.DAILY,
          'weekly': RRule.WEEKLY,
          'monthly': RRule.MONTHLY,
          'yearly': RRule.YEARLY
        };
        
        const freq = frequencyMap[newEvent.recurrenceRule];
        
        if (freq !== undefined) {
          // Use the appropriate date as the start date for the recurrence rule
          const startDate = newEvent.type === "activity" 
            ? (newEvent.activityDate || new Date()) 
            : (newEvent.start || new Date());
          
          // Create a proper RRule string with correct frequency
          const rruleObj = new RRule({
            freq: freq,
            dtstart: startDate
          });
          rruleString = rruleObj.toString();
          console.log("Created RRule string:", rruleString);
        } else {
          console.error("Invalid recurrence rule value:", newEvent.recurrenceRule);
          alert("Invalid recurrence rule");
          return;
        }
      } catch (error) {
        console.error("Error creating rrule:", error);
        alert("Invalid recurrence rule");
        return;
      }
    }

    // Create event data object with shared properties
    const eventData = {
      title: newEvent.title || (newEvent.type === "pomodoro" ? "Pomodoro Session" : ""),
      description: newEvent.desc || "",
      location: newEvent.location || "",
      type: newEvent.type,
      user: newEvent.user,
    };
    
    // Add type-specific properties
    switch(newEvent.type) {
      case "activity":
        eventData.activityDate = (newEvent.activityDate || new Date()).toISOString();
        eventData.recurrenceRule = rruleString; // Add recurrence rule to activities
        break;
      case "pomodoro":
        eventData.cyclesLeft = newEvent.cyclesLeft || 0;
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
    
    console.log("Event Data Sent to Backend:", eventData);

    if (isEditing) eventData._id = newEvent.id;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          fetchAllEvents();
          setShowModal(false);
          resetForm();
        } else {
          alert(json.message);
        }
      })
      .catch((err) => console.error("Error saving event:", err));
  };

  const handleDeleteEvent = () => {
    fetch(`http://localhost:5000/api/events/remove/${newEvent.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          fetchAllEvents();
          setShowModal(false);
          resetForm();
        } else {
          alert(json.message);
        }
      })
      .catch((err) => console.error("Error deleting event:", err));
  };

  const resetForm = () => {
    setNewEvent({
      id: "",
      title: "",
      type: "event",
      cyclesLeft: null,
      activityDate: null,
      start: new Date(),
      end: new Date(),
      location: "",
      recurrenceRule: "",
      desc: "",
    });
    setIsEditing(false);
  };

  return (
    <div className="calendar-container">
      <CalendarView
        events={events}
        handleDateSelect={handleDateSelect}
        handleEventClick={handleEventClick}
        locale={itLocale}
      />

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