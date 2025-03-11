import React from 'react';
import './TaskCard.css';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'low':
      return '#d4edda'; // Jasny zielony
    case 'medium':
      return '#fff3cd'; // Jasny żółty
    case 'high':
      return '#f8d7da'; // Jasny czerwony
    default:
      return '#ffffff'; // Biały (domyślny)
  }
};

const TaskCard = ({ task, onDelete, onClick, dragHandleProps }) => {
  const priorityColor = getPriorityColor(task.priority);

  return (
    <div
      className="task-card"
      style={{ backgroundColor: priorityColor }} // Zastosuj kolor tła
      onClick={onClick}
    >
      <div className="task-header" {...dragHandleProps}>
        <h3>{task.title}</h3>
        <button onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}>Delete</button>
      </div>
      <p>{task.description}</p>
    </div>
  );
};

export default TaskCard;