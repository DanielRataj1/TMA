import React, { useState, useEffect } from 'react';

const TaskManager = ({ userId }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  // Pobierz zadania po zalogowaniu
  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  // Funkcja do pobierania zadań
  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err.message);
      setTasks([]); // Ustaw tasks na pustą tablicę w przypadku błędu
    }
  };

  // Funkcja do dodawania zadania
  const addTask = async () => {
    if (!newTask.title || !userId) {
      console.error('Title and userId are required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const data = await response.json();
      setTasks([...tasks, data]);
      setNewTask({ title: '', description: '' });
    } catch (err) {
      console.error('Error adding task:', err.message);
    }
  };

  return (
    <div className="task-manager">
      <h2>Task Manager</h2>
      <div>
        <input
          type="text"
          placeholder="Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;