// src/components/TaskCard.jsx
import React from 'react';

const TaskCard = ({ task, onDelete, onClick, dragHandleProps }) => {
  return (
    <div className="task-card" onClick={onClick}>
      <div {...dragHandleProps} className="drag-handle">&#9776;</div> {/* Przekaż dragHandleProps tutaj */}
      <h4>{task.title}</h4>
      <button onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}>Delete</button>
    </div>
  );
};

export default TaskCard;