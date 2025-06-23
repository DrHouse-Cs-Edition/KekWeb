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

  const processAndSortTodos = useCallback((activities) => {
    const now = new Date();
    
    const processedTodos = activities.map(activity => {
      const activityDate = new Date(activity.activityDate);
      const daysDiff = Math.ceil((now - activityDate) / (1000 * 60 * 60 * 24));
      
      let calculatedUrgency = activity.urgencyLevel || 0;
      
      // Increase urgency if past due date
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

    // Sort by urgency (highest first), then by date (earliest first)
    return processedTodos.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // Completed items go to bottom
      }
      if (a.calculatedUrgency !== b.calculatedUrgency) {
        return b.calculatedUrgency - a.calculatedUrgency;
      }
      return new Date(a.activityDate) - new Date(b.activityDate);
    });
  }, []);

  const fetchTodos = useCallback(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/events/all", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          // Filter for activities only
          const activities = json.list.filter(event => event.type === 'activity');
          const processedTodos = processAndSortTodos(activities);
          setTodos(processedTodos);
          setError(null);
        } else {
          setError('No todos found');
        }
      })
      .catch((err) => {
        console.error('Error fetching todos:', err);
        setError('Failed to load todos');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [processAndSortTodos]);

  const updateUrgencyLevels = useCallback(() => {
    setTodos(prevTodos => processAndSortTodos(prevTodos));
  }, [processAndSortTodos]);

  useEffect(() => {
    fetchTodos();
    
    const interval = setInterval(() => {
      updateUrgencyLevels();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchTodos, updateUrgencyLevels]);

  const toggleComplete = async (todoId, completed) => {
    try {
      // Use the correct endpoint that matches your backend route
      const response = await fetch(`http://localhost:5000/api/events/toggle-complete/${todoId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !completed }),
      });

      const result = await response.json();

      if (result.success) {
        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo._id === todoId ? { ...todo, completed: !completed } : todo
          )
        );
        
        // Also update selectedTodo if it's the one being toggled
        if (selectedTodo && selectedTodo._id === todoId) {
          setSelectedTodo(prev => ({ ...prev, completed: !completed }));
        }
      } else {
        console.error('Error:', result.message);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const getUrgencyColor = (urgency, isOverdue) => {
    if (urgency >= 8) return '#dc2626'; // Red
    if (urgency >= 6) return '#ea580c'; // Orange-red
    if (urgency >= 4) return '#d97706'; // Orange
    if (urgency >= 2) return '#ca8a04'; // Yellow-orange
    if (isOverdue) return '#65a30d'; // Yellow-green
    return '#059669'; // Green
  };

  const getUrgencyBadge = (urgency, isOverdue) => {
    if (urgency >= 8) return { text: 'CRITICAL', color: '#dc2626' };
    if (urgency >= 6) return { text: 'HIGH', color: '#ea580c' };
    if (urgency >= 4) return { text: 'MEDIUM', color: '#d97706' };
    if (urgency >= 2) return { text: 'LOW', color: '#ca8a04' };
    return { text: 'NORMAL', color: '#059669' };
  };

  const formatDate = (date) => {
    if (!date) return '';
    const activityDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (activityDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (activityDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    if (activityDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return activityDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: activityDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleEditClick = (todo) => {
    setEditingTodo({
      id: todo._id,
      title: todo.title,
      description: todo.description || "",
      activityDate: todo.activityDate ? new Date(todo.activityDate).toISOString().split('T')[0] : "",
    });
    setShowEditModal(true);
    setSelectedTodo(null); // Close details modal
  };

  const handleSaveEdit = async () => {
    if (!editingTodo.title.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/events/update/${editingTodo.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingTodo.title,
          description: editingTodo.description,
          activityDate: editingTodo.activityDate,
          type: "activity" // Ensure it stays as activity
        }),
      });

      const result = await response.json();

      if (result.success) {
        fetchTodos(); // Refresh the todo list
        setShowEditModal(false);
        setEditingTodo(null);
      } else {
        console.error('Error:', result.message);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
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
          <button onClick={fetchTodos} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Todo List</h1>
        <p className={styles.subtitle}>
          {todos.filter(t => !t.completed).length} pending • {todos.filter(t => t.completed).length} completed
        </p>
      </div>

      {todos.length === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle className={styles.emptyIcon} />
          <p className={styles.emptyText}>All caught up!</p>
          <p className={styles.emptySubtext}>No todos to show</p>
        </div>
      ) : (
        <div className={styles.todosList}>
          {todos.map((todo) => {
            const urgencyBadge = getUrgencyBadge(todo.calculatedUrgency, todo.isOverdue);
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
                        color: todo.isOverdue && !todo.completed ? '#dc2626' : '#9ca3af'
                      }}>
                        {formatDate(todo.activityDate)}
                        {todo.daysPastDue > 0 && !todo.completed && (
                          <span className={styles.overdueBadge}>
                            {todo.daysPastDue} day{todo.daysPastDue > 1 ? 's' : ''} overdue
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

      {/* Todo Details Modal */}
      {selectedTodo && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Todo Details</h2>
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
                  <h4 className={styles.modalDescriptionTitle}>Description</h4>
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
                Close
              </button>
              <button 
                onClick={() => handleEditClick(selectedTodo)}
                className={styles.editButton}
              >
                <Edit3 className={styles.editIcon} />
                Edit Todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Todo Modal */}
      {showEditModal && editingTodo && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Todo</h2>
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
                    Title *
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
                    Description
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
                    Due Date
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
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className={styles.editButton}
                disabled={!editingTodo.title.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default TodoList;