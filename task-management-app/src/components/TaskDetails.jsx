import React, { useState } from 'react';

const TaskDetails = ({ task, listTitle, onClose, onSave }) => {
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'medium'); // Stan dla priorytetu

  const handleSave = () => {
    onSave(task._id, description, priority); // Przekaż również priorytet
    onClose();
  };

  return (
    <div className="task-details-modal">
      <div className="task-details-content">
        <p><strong>Lista:</strong> {listTitle}</p> {/* Informacja o liście */}
        <h3>{task.title}</h3> {/* Nazwa zadania */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dodaj opis zadania..."
        />
        {/* Pole wyboru priorytetu */}
        <div className="priority-selector">
          <label htmlFor="priority">Priorytet:</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Niski</option>
            <option value="medium">Średni</option>
            <option value="high">Wysoki</option>
          </select>
        </div>
        <div className="task-details-actions">
          <button onClick={handleSave}>Zapisz</button>
          <button onClick={onClose}>Anuluj</button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;