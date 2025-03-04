// src/components/TaskDetails.jsx
import React, { useState } from 'react';

const TaskDetails = ({ task, listTitle, onClose, onSave }) => {
  const [description, setDescription] = useState(task.description || '');

  const handleSave = () => {
    onSave(task._id, description);
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
        <div className="task-details-actions">
          <button onClick={handleSave}>Zapisz</button>
          <button onClick={onClose}>Anuluj</button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;