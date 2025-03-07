import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import TaskDetails from './TaskDetails';
import './ListManager.css';

const ListManager = ({ userId }) => {
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState({});
  const [newListTitle, setNewListTitle] = useState('');
  const [newTaskTitles, setNewTaskTitles] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedListTitle, setSelectedListTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Stan dla wyszukiwania

  // Funkcja do filtrowania zadań na podstawie wyszukiwanej frazy
  const filterTasks = (tasks, query) => {
    if (!query) return tasks;

    return tasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(query.toLowerCase());
      const descriptionMatch = task.description?.toLowerCase().includes(query.toLowerCase());
      return titleMatch || descriptionMatch;
    });
  };

  // Efekt do pobierania list i zadań
  useEffect(() => {
    if (userId) {
      fetchLists();
    }
  }, [userId]);

  // Funkcja do pobierania list
  const fetchLists = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/lists`, {
        headers: { 'Authorization': token },
      });
      const data = await response.json();
      setLists(data);
      data.forEach(list => fetchTasks(list._id));
    } catch (err) {
      console.error('Error fetching lists:', err);
    }
  };

  // Funkcja do pobierania zadań
  const fetchTasks = async (listId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/tasks?listId=${listId}`, {
        headers: { 'Authorization': token },
      });
      const data = await response.json();
      setTasks(prev => ({ ...prev, [listId]: data }));
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  // Funkcja do dodawania listy
  const addList = async () => {
    if (!newListTitle || !userId) {
      console.error('Title and userId are required.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/lists', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ title: newListTitle, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add list');
      }

      const data = await response.json();
      setLists([...lists, data]);
      setNewListTitle('');
    } catch (err) {
      console.error('Error adding list:', err.message);
    }
  };

  // Funkcja do usuwania listy
  const deleteList = async (listId) => {
    const list = lists.find(list => list._id === listId);
    if (!list) return;

    const confirmDelete = window.confirm(
      `Czy na pewno chcesz usunąć listę "${list.title}"? Usuniesz wszystkie zawarte w niej zadania.`
    );

    if (confirmDelete) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/lists/${listId}`, {
          method: 'DELETE',
          headers: { 'Authorization': token },
        });

        if (!response.ok) {
          throw new Error('Failed to delete list');
        }

        setLists(lists.filter(list => list._id !== listId));
      } catch (err) {
        console.error('Error deleting list:', err.message);
      }
    }
  };

  // Funkcja do dodawania zadania
  const addTask = async (listId, title) => {
    if (!title || !listId) {
      console.error('Title and listId are required.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ title, listId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const data = await response.json();
      setTasks(prevTasks => ({
        ...prevTasks,
        [listId]: [...(prevTasks[listId] || []), data],
      }));
      setNewTaskTitles(prev => ({ ...prev, [listId]: '' }));
    } catch (err) {
      console.error('Error adding task:', err.message);
    }
  };

  // Funkcja do usuwania zadania
  const deleteTask = async (taskId, listId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token },
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(prevTasks => ({
        ...prevTasks,
        [listId]: prevTasks[listId].filter(task => task._id !== taskId),
      }));
    } catch (err) {
      console.error('Error deleting task:', err.message);
    }
  };

  // Funkcja do aktualizacji opisu zadania
  const updateTaskDescription = async (taskId, description) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTasks = { ...tasks };
      for (const listId in updatedTasks) {
        updatedTasks[listId] = updatedTasks[listId].map(task =>
          task._id === taskId ? { ...task, description } : task
        );
      }
      setTasks(updatedTasks);
    } catch (err) {
      console.error('Error updating task:', err.message);
    }
  };

  // Funkcja do obsługi przeciągania i upuszczania
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceListId = source.droppableId;
    const destinationListId = destination.droppableId;
    const taskId = draggableId;

    const sourceTasks = Array.from(tasks[sourceListId] || []);
    const destinationTasks = Array.from(tasks[destinationListId] || []);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    destinationTasks.splice(destination.index, 0, movedTask);

    setTasks(prevTasks => ({
      ...prevTasks,
      [sourceListId]: sourceTasks,
      [destinationListId]: destinationTasks,
    }));

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ listId: destinationListId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err.message);
    }
  };

  // Funkcja do obsługi kliknięcia na zadanie
  const handleTaskClick = (task, listId) => {
    const list = lists.find(list => list._id === listId);
    if (list) {
      setSelectedListTitle(list.title);
      setSelectedTask(task);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="list-manager">
        <h1 className="board-title">Twoja tablica :)</h1>

        {/* Pole wyszukiwania */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Wyszukaj zadania..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="add-list-container">
          <input
            type="text"
            placeholder="New list title"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
          />
          <button onClick={addList}>Add List</button>
        </div>

        <div className="lists-container">
          {lists.map(list => (
            <Droppable key={list._id} droppableId={list._id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="list"
                >
                  <h3>{list.title}</h3>
                  <button onClick={() => deleteList(list._id)}>Delete</button>
                  <div className="tasks-container">
  {filterTasks(tasks[list._id] || [], searchQuery).map((task, index) => (
    <Draggable key={task._id} draggableId={task._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <TaskCard
            task={task}
            onDelete={(taskId) => deleteTask(taskId, list._id)}
            onClick={() => handleTaskClick(task, list._id)}
            dragHandleProps={provided.dragHandleProps}
          />
        </div>
      )}
    </Draggable>
  ))}
  {provided.placeholder}
</div>
                  <div className="add-task-container">
                    <input
                      type="text"
                      placeholder="New task title"
                      value={newTaskTitles[list._id] || ''}
                      onChange={(e) =>
                        setNewTaskTitles(prev => ({
                          ...prev,
                          [list._id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() => {
                        if (newTaskTitles[list._id]?.trim()) {
                          addTask(list._id, newTaskTitles[list._id].trim());
                        }
                      }}
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
        {selectedTask && (
          <TaskDetails
            task={selectedTask}
            listTitle={selectedListTitle}
            onClose={() => setSelectedTask(null)}
            onSave={updateTaskDescription}
          />
        )}
      </div>
    </DragDropContext>
  );
};

export default ListManager;