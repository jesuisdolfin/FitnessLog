import React from 'react';
import './WeightliftingLog.css';

function WeightliftingLog({ logs, onDelete, onEdit, darkMode }) {
  return (
    <table className={`table table-bordered mt-4 ${darkMode ? 'dark' : ''}`}>
      <thead>
        <tr>
          <th>Exercise</th>
          <th>Sets</th>
          <th>Reps</th>
          <th>Weight</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {logs.length > 0 ? (
          logs.map((log) => (
            <tr key={log._id}>
              <td>{log.exercise}</td>
              <td>{log.sets}</td>
              <td>{log.reps}</td>
              <td>{log.weight}</td>
              <td>{log.date}</td>
              <td>
                <button className="btn btn-warning" onClick={() => onEdit(log)}>
                  Edit
                </button>
                <button
                  className="btn btn-danger ml-2"
                  onClick={() => onDelete(log._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6">No logs available</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default WeightliftingLog;
