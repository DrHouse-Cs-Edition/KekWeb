import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Calendar, X, Edit3, Plus } from 'lucide-react';
import styles from './TodoList.module.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    activityDate: ''
  });
  const [serverDate, setServerDate] = useState(new Date());

  // Function to get server date from time machine API
  const fetchServerDate = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/timeMachine/date", {
        method: "GET",
        credentials: "include",
      });
      const json = await response.json();
      if (json.success) {
        return new Date(json.date);
      }
    } catch (error) {
      console.error('Error fetching server date:', error);
    }
    return new Date();
  };

  // Function to process and sort todos
  const processAndSortTodos = (activities, currentDate) => {
    let processedTodos = activities.map(activity => {
      let calculatedUrgency = activity.urgencyLevel || 0;
      let daysPastDue = 0;
      let isOverdue = false;

      // Solo se ha una data di scadenza, calcola l'urgenza in base ai giorni
      if (activity.activityDate) {
        let activityDate = new Date(activity.activityDate);
        // Normalizza le date a mezzanotte per il confronto
        let normalizedActivityDate = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());
        let normalizedCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        
        let daysDiff = Math.ceil((normalizedCurrentDate - normalizedActivityDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 0) {
          calculatedUrgency = Math.min(10, calculatedUrgency + daysDiff);
          daysPastDue = daysDiff;
          isOverdue = true;
        }
      }
      
      return {
        ...activity,
        calculatedUrgency,
        daysPastDue,
        isOverdue
      };
    });

    return processedTodos.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Le attività con data di scadenza hanno priorità su quelle senza
      if ((a.activityDate && !b.activityDate)) return -1;
      if ((!a.activityDate && b.activityDate)) return 1;
      
      if (a.calculatedUrgency !== b.calculatedUrgency) {
        return b.calculatedUrgency - a.calculatedUrgency;
      }
      
      // Se entrambe hanno data, ordina per data
      if (a.activityDate && b.activityDate) {
        return new Date(a.activityDate) - new Date(b.activityDate);
      }
      
      // Se nessuna ha data, ordina per titolo
      return a.title.localeCompare(b.title);
    });
  };

  // Function to load todos from backend
  const fetchTodos = async (useTimeMachine = false) => {
    try {
      let currentDate = serverDate;
      
      if (useTimeMachine) {
        currentDate = await fetchServerDate();
        setServerDate(currentDate);
      }
      
      const response = await fetch("http://localhost:5000/api/events/all", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      
      if (data.success) {
        let activities = data.list.filter(event => event.type === 'activity');
        let processedTodos = processAndSortTodos(activities, currentDate);
        setTodos(processedTodos);
        setError(null);
      } else {
        setError('Nessun todo trovato');
      }
    } catch (err) {
      console.error('Errore nel caricamento todos:', err);
      setError('Errore nel caricamento todos');
    } finally {
      setLoading(false);
    }
  };

  // Initial load only
  useEffect(() => {
    fetchTodos(true);
  }, []);

  // Format date function
  const formatDate = (date) => {
    if (!date) return '';
    let activityDate = new Date(date);
    let today = serverDate;
    let tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    let yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (activityDate.toDateString() === today.toDateString()) {
      return 'Oggi';
    }
    if (activityDate.toDateString() === tomorrow.toDateString()) {
      return 'Domani';
    }
    if (activityDate.toDateString() === yesterday.toDateString()) {
      return 'Ieri';
    }
    
    return activityDate.toLocaleDateString('it-IT', {
      month: 'short',
      day: 'numeric',
      year: activityDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  // Toggle complete function
  const toggleComplete = async (todoId, completed) => {
    if (!completed) {
      if (!window.confirm("Sei sicuro di voler segnare questa attività come completata?")) {
        return;
      }
    }
    
    try {
      let response = await fetch(`http://localhost:5000/api/events/toggle-complete/${todoId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !completed }),
      });

      let result = await response.json();

      if (result.success) {
        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo._id === todoId ? { ...todo, completed: !completed } : todo
          )
        );
        
        if (selectedTodo && selectedTodo._id === todoId) {
          setSelectedTodo(prev => ({ ...prev, completed: !completed }));
        }
      } else {
        console.error('Errore:', result.message);
        alert('Errore nel completare il todo');
      }
    } catch (error) {
      console.error('Errore aggiornamento todo:', error);
      alert('Errore di connessione');
    }
  };

  // Get urgency color - modificato per gestire attività senza data
  const getUrgencyColor = (urgency, isOverdue, hasDate) => {
    // Se non ha data di scadenza, sempre verde
    if (!hasDate) return '#059669';
    
    if (urgency >= 8) return '#dc2626';
    if (urgency >= 6) return '#ea580c';
    if (urgency >= 4) return '#d97706';
    if (urgency >= 2) return '#ca8a04';
    if (isOverdue) return '#65a30d';
    return '#059669';
  };

  // Get urgency badge - modificato per gestire attività senza data
  const getUrgencyBadge = (urgency, isOverdue, hasDate) => {
    if (!hasDate) return { text: 'NESSUNA SCADENZA', color: '#059669' };
    
    if (urgency >= 8) return { text: 'CRITICO', color: '#dc2626' };
    if (urgency >= 6) return { text: 'ALTO', color: '#ea580c' };
    if (urgency >= 4) return { text: 'MEDIO', color: '#d97706' };
    if (urgency >= 2) return { text: 'BASSO', color: '#ca8a04' };
    return { text: 'NORMALE', color: '#059669' };
  };

  // Handle edit click
  const handleEditClick = (todo) => {
    setEditingTodo({
      id: todo._id,
      title: todo.title,
      description: todo.description || "",
      activityDate: todo.activityDate ? new Date(todo.activityDate).toISOString().split('T')[0] : "",
    });
    setShowEditModal(true);
    setSelectedTodo(null);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingTodo.title.trim()) {
      alert('Inserisci un titolo!');
      return;
    }

    try {
      let response = await fetch(`http://localhost:5000/api/events/update/${editingTodo.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingTodo.title,
          description: editingTodo.description,
          activityDate: editingTodo.activityDate,
          type: "activity"
        }),
      });

      let result = await response.json();

      if (result.success) {
        await fetchTodos(false);
        setShowEditModal(false);
        setEditingTodo(null);
      } else {
        console.error('Errore:', result.message);
        alert('Errore nel salvare le modifiche');
      }
    } catch (error) {
      console.error('Errore aggiornamento todo:', error);
      alert('Errore di connessione');
    }
  };

  // Handle add new todo
  const handleAddClick = () => {
    setNewTodo({
      title: '',
      description: '',
      activityDate: ''
    });
    setShowAddModal(true);
  };

  // Save new todo
  const handleSaveNewTodo = async () => {
    if (!newTodo.title.trim()) {
      alert('Inserisci un titolo!');
      return;
    }

    try {
      const requestBody = {
        title: newTodo.title,
        description: newTodo.description || '',
        type: 'activity',
        completed: false,
        urgencyLevel: 1
      };

      // Solo aggiunge activityDate se è stata fornita
      if (newTodo.activityDate) {
        const activityDateTime = new Date(newTodo.activityDate + 'T12:00:00');
        requestBody.activityDate = activityDateTime.toISOString();
      }

      const response = await fetch('http://localhost:5000/api/events/save', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchTodos(false);
        setShowAddModal(false);
        setNewTodo({ title: '', description: '', activityDate: '' });
      } else {
        console.error('Server error:', result.message);
        alert('Errore nel creare la nuova attività: ' + (result.message || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore creazione attività:', error);
      alert('Errore di connessione: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingTitle}></div>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.loadingCard}>
              <div className={styles.loadingLine}></div>
              <div className={styles.loadingLineShort}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
          <button onClick={() => fetchTodos(true)} className={styles.retryButton}>
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Lista Attività</h1>
            <p className={styles.subtitle}>
              {todos.filter(t => !t.completed).length} da fare • {todos.filter(t => t.completed).length} completati
            </p>
          </div>
          <button 
            onClick={handleAddClick}
            className={styles.addButton}
            title="Aggiungi nuova attività"
          >
            <Plus className={styles.addIcon} />
          </button>
        </div>
      </div>

      {todos.filter(t => !t.completed).length === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle className={styles.emptyIcon} />
          <p className={styles.emptyText}>Tutto fatto!</p>
          <p className={styles.emptySubtext}>Nessun todo da completare</p>
          <button 
            onClick={handleAddClick}
            className={styles.emptyAddButton}
          >
            <Plus className={styles.addIcon} />
            Aggiungi prima attività
          </button>
        </div>
      ) : (
        <div className={styles.todosList}>
          {todos
            .filter(todo => !todo.completed)
            .map((todo) => {
              const hasDate = !!todo.activityDate;
              return (
                <div
                  key={todo._id}
                  className={styles.todoCard}
                  style={{
                    borderLeftColor: getUrgencyColor(todo.calculatedUrgency, todo.isOverdue, hasDate),
                    opacity: todo.completed ? 0.6 : 1,
                  }}
                  onClick={() => setSelectedTodo(todo)}
                >
                  <div className={styles.todoContent}>
                    <div className={styles.todoHeader}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(todo._id, todo.completed);
                        }}
                        className={styles.checkButton}
                      >
                        {todo.completed ? (
                          <CheckCircle className={styles.checkIcon} />
                        ) : (
                          <Circle className={styles.checkIcon} />
                        )}
                      </button>
                      <h3
                        className={styles.todoTitle}
                        style={{
                          textDecoration: todo.completed ? 'line-through' : 'none'
                        }}
                      >
                        {todo.title}
                      </h3>
                    </div>
                    
                    <div className={styles.todoMeta}>
                      <div className={styles.dateInfo}>
                        <Calendar className={styles.metaIcon} />
                        <span style={{
                          color: (todo.isOverdue && !todo.completed && hasDate) ? '#dc2626' : '#9ca3af'
                        }}>
                          {hasDate ? formatDate(todo.activityDate) : 'Nessuna scadenza'}
                          {todo.daysPastDue > 0 && !todo.completed && hasDate && (
                            <span className={styles.overdueBadge}>
                              {todo.daysPastDue} giorno{todo.daysPastDue > 1 ? 'i' : ''} in ritardo
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    {todo.description && (
                      <p className={styles.todoDescription}>
                        {todo.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Modal dei dettagli del todo */}
      {selectedTodo && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Dettagli Todo</h2>
              <button
                onClick={() => setSelectedTodo(null)}
                className={styles.closeButton}
              >
                <X className={styles.closeIcon} />
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.modalTodoHeader}>
                <button
                  onClick={() => toggleComplete(selectedTodo._id, selectedTodo.completed)}
                  className={styles.modalCheckButton}
                >
                  {selectedTodo.completed ? (
                    <CheckCircle className={styles.modalCheckIcon} />
                  ) : (
                    <Circle className={styles.modalCheckIcon} />
                  )}
                </button>
                <h3
                  className={styles.modalTodoTitle}
                  style={{
                    textDecoration: selectedTodo.completed ? 'line-through' : 'none'
                  }}
                >
                  {selectedTodo.title}
                </h3>
              </div>
              
              <div className={styles.modalTodoDetails}>
                <div className={styles.modalDetailItem}>
                  <Calendar className={styles.modalDetailIcon} />
                  <span>
                    {selectedTodo.activityDate ? formatDate(selectedTodo.activityDate) : 'Nessuna scadenza'}
                  </span>
                </div>
              </div>
              
              {selectedTodo.description && (
                <div className={styles.modalDescription}>
                  <h4 className={styles.modalDescriptionTitle}>Descrizione</h4>
                  <p className={styles.modalDescriptionText}>
                    {selectedTodo.description}
                  </p>
                </div>
              )}
            </div>
            
            <div className={styles.modalFooter}>
              <button
                onClick={() => setSelectedTodo(null)}
                className={styles.cancelButton}
              >
                Chiudi
              </button>
              <button 
                onClick={() => handleEditClick(selectedTodo)}
                className={styles.editButton}
              >
                <Edit3 className={styles.editIcon} />
                Modifica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal per modificare il todo */}
      {showEditModal && editingTodo && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Modifica Todo</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTodo(null);
                }}
                className={styles.closeButton}
              >
                <X className={styles.closeIcon} />
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ffe5d9' }}>
                    Titolo *
                  </label>
                  <input
                    type="text"
                    value={editingTodo.title}
                    onChange={(e) => setEditingTodo(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #5c3c6e',
                      backgroundColor: 'rgba(36, 41, 73, 0.95)',
                      color: '#ffe5d9'
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ffe5d9' }}>
                    Descrizione
                  </label>
                  <textarea
                    value={editingTodo.description}
                    onChange={(e) => setEditingTodo(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #5c3c6e',
                      backgroundColor: 'rgba(36, 41, 73, 0.95)',
                      color: '#ffe5d9',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ffe5d9' }}>
                    Data di scadenza
                  </label>
                  <input
                    type="date"
                    value={editingTodo.activityDate}
                    onChange={(e) => setEditingTodo(prev => ({ ...prev, activityDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #5c3c6e',
                      backgroundColor: 'rgba(36, 41, 73, 0.95)',
                      color: '#ffe5d9'
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTodo(null);
                }}
                className={styles.cancelButton}
              >
                Annulla
              </button>
              <button 
                onClick={handleSaveEdit}
                className={styles.editButton}
                disabled={!editingTodo.title.trim()}
              >
                Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal per aggiungere nuovo todo */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Nuova Attività</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTodo({ title: '', description: '', activityDate: '' });
                }}
                className={styles.closeButton}
              >
                <X className={styles.closeIcon} />
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ffe5d9' }}>
                    Titolo *
                  </label>
                  <input
                    type="text"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Inserisci il titolo dell'attività..."
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #5c3c6e',
                      backgroundColor: 'rgba(36, 41, 73, 0.95)',
                      color: '#ffe5d9'
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ffe5d9' }}>
                    Descrizione
                  </label>
                  <textarea
                    value={newTodo.description}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrizione opzionale..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #5c3c6e',
                      backgroundColor: 'rgba(36, 41, 73, 0.95)',
                      color: '#ffe5d9',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ffe5d9' }}>
                    Data di scadenza (opzionale)
                  </label>
                  <input
                    type="date"
                    value={newTodo.activityDate}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, activityDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #5c3c6e',
                      backgroundColor: 'rgba(36, 41, 73, 0.95)',
                      color: '#ffe5d9'
                    }}
                  />
                  <small style={{ color: '#b3a1c7', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Lascia vuoto se non hai una scadenza specifica
                  </small>
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTodo({ title: '', description: '', activityDate: '' });
                }}
                className={styles.cancelButton}
              >
                Annulla
              </button>
              <button 
                onClick={handleSaveNewTodo}
                className={styles.editButton}
                disabled={!newTodo.title.trim()}
              >
                <Plus className={styles.addIcon} />
                Crea Attività
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;