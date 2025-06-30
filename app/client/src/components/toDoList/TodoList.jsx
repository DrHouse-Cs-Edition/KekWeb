import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Circle, Calendar, X, Edit3 } from 'lucide-react';
import styles from './TodoList.module.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  // Funzione per processare e ordinare i todos
  const processAndSortTodos = useCallback((activities) => {
    let now = new Date();
    
    let processedTodos = activities.map(activity => {
      let activityDate = new Date(activity.activityDate);
      let daysDiff = Math.ceil((now - activityDate) / (1000 * 60 * 60 * 24));
      
      let calculatedUrgency = activity.urgencyLevel || 0;
      
      // Se è scaduto, aumenta l'urgenza
      if (daysDiff > 0) {
        calculatedUrgency = Math.min(10, calculatedUrgency + daysDiff);
      }
      
      return {
        ...activity,
        calculatedUrgency,
        daysPastDue: Math.max(0, daysDiff),
        isOverdue: daysDiff > 0
      };
    });

    // Ordino per urgenza (più alto primo), poi per data (prima data)
    return processedTodos.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // I completati vanno in fondo
      }
      if (a.calculatedUrgency !== b.calculatedUrgency) {
        return b.calculatedUrgency - a.calculatedUrgency;
      }
      return new Date(a.activityDate) - new Date(b.activityDate);
    });
  }, []);

  // Funzione per caricare i todos dal backend
  const fetchTodos = useCallback(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Filtro solo le attività
          let activities = data.list.filter(event => event.type === 'activity');
          let processedTodos = processAndSortTodos(activities);
          setTodos(processedTodos);
          setError(null);
        } else {
          setError('Nessun todo trovato');
        }
      })
      .catch((err) => {
        console.error('Errore nel caricamento todos:', err);
        setError('Errore nel caricamento todos');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [processAndSortTodos]);

  // Aggiorna i livelli di urgenza periodicamente
  const updateUrgencyLevels = useCallback(() => {
    setTodos(prevTodos => processAndSortTodos(prevTodos));
  }, [processAndSortTodos]);

  // useEffect per caricare i datos all'inizio
  useEffect(() => {
    fetchTodos();
    
    // Aggiorno l'urgenza ogni minuto
    let interval = setInterval(() => {
      updateUrgencyLevels();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchTodos, updateUrgencyLevels]);

  // Funzione per completare/scompletare un todo
  const toggleComplete = async (todoId, completed) => {
    // Chiedo conferma quando marco come completato
    if (!completed) {
      if (!window.confirm("Sei sicuro di voler segnare questa attività come completata?")) {
        return; // Non procedo se l'utente annulla
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
        // Aggiorno lo stato locale
        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo._id === todoId ? { ...todo, completed: !completed } : todo
          )
        );
        
        // Aggiorno anche il todo selezionato se è quello che sto modificando
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

  // Funzione per ottenere il colore dell'urgenza
  const getUrgencyColor = (urgency, isOverdue) => {
    if (urgency >= 8) return '#dc2626'; // Rosso
    if (urgency >= 6) return '#ea580c'; // Arancione-rosso
    if (urgency >= 4) return '#d97706'; // Arancione
    if (urgency >= 2) return '#ca8a04'; // Giallo-arancione
    if (isOverdue) return '#65a30d'; // Verde-giallo
    return '#059669'; // Verde
  };

  // Funzione per ottenere il badge dell'urgenza
  const getUrgencyBadge = (urgency, isOverdue) => {
    if (urgency >= 8) return { text: 'CRITICO', color: '#dc2626' };
    if (urgency >= 6) return { text: 'ALTO', color: '#ea580c' };
    if (urgency >= 4) return { text: 'MEDIO', color: '#d97706' };
    if (urgency >= 2) return { text: 'BASSO', color: '#ca8a04' };
    return { text: 'NORMALE', color: '#059669' };
  };

  // Formatto la data in modo carino
  const formatDate = (date) => {
    if (!date) return '';
    let activityDate = new Date(date);
    let today = new Date();
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

  // Quando clicco su modifica
  const handleEditClick = (todo) => {
    setEditingTodo({
      id: todo._id,
      title: todo.title,
      description: todo.description || "",
      activityDate: todo.activityDate ? new Date(todo.activityDate).toISOString().split('T')[0] : "",
    });
    setShowEditModal(true);
    setSelectedTodo(null); // Chiudo il modal dei dettagli
  };

  // Salvo le modifiche
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
          type: "activity" // Mi assicuro che rimanga un'attività
        }),
      });

      let result = await response.json();

      if (result.success) {
        fetchTodos(); // Ricarico la lista
        setShowEditModal(false);
        setEditingTodo(null);
        console.log('Todo aggiornato con successo');
      } else {
        console.error('Errore:', result.message);
        alert('Errore nel salvare le modifiche');
      }
    } catch (error) {
      console.error('Errore aggiornamento todo:', error);
      alert('Errore di connessione');
    }
  };

  // Se sto caricando mostro il loading
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

  // Se c'è un errore lo mostro
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
          <button onClick={fetchTodos} className={styles.retryButton}>
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Lista Todo</h1>
        <p className={styles.subtitle}>
          {todos.filter(t => !t.completed).length} da fare • {todos.filter(t => t.completed).length} completati
        </p>
      </div>

      {todos.filter(t => !t.completed).length === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle className={styles.emptyIcon} />
          <p className={styles.emptyText}>Tutto fatto!</p>
          <p className={styles.emptySubtext}>Nessun todo da completare</p>
        </div>
      ) : (
        <div className={styles.todosList}>
          {todos
            .filter(todo => !todo.completed) // Mostro solo quelli non completati
            .map((todo) => {
              let urgencyBadge = getUrgencyBadge(todo.calculatedUrgency, todo.isOverdue);
              return (
                <div
                  key={todo._id}
                  className={styles.todoCard}
                  style={{
                    borderLeftColor: getUrgencyColor(todo.calculatedUrgency, todo.isOverdue),
                    opacity: todo.completed ? 0.6 : 1,
                  }}
                  onClick={() => setSelectedTodo(todo)}
                >
                  <div className={styles.todoContent}>
                    <div className={styles.todoHeader}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Non voglio che si apra il modal quando clicco sul checkbox
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
                          color: todo.isOverdue && !todo.completed ? '#dc2626' : '#9ca3af'
                        }}>
                          {formatDate(todo.activityDate)}
                          {todo.daysPastDue > 0 && !todo.completed && (
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
                  <span>{formatDate(selectedTodo.activityDate)}</span>
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
    </div>
  );
};

export default TodoList;