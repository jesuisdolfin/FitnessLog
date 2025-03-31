import React, { useState } from 'react';
import './WeightliftingLog.css';

function WeightliftingLog({ logs, onDelete, onEdit, darkMode }) {
  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    if (!acc[log.date]) {
      acc[log.date] = [];
    }
    acc[log.date].push(log);
    return acc;
  }, {});

  // State to track which dates are expanded
  const [expandedDates, setExpandedDates] = useState({});

  const toggleDate = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  return (
    <div className={`weightlifting-log ${darkMode ? 'dark' : ''}`}>
      <table className="table table-bordered mt-4">
        <thead>
          <tr>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedLogs).length > 0 ? (
            Object.keys(groupedLogs).map((date) => (
              <React.Fragment key={date}>
                {/* Row for the date */}
                <tr>
                  <td>{date}</td>
                  <td>
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => toggleDate(date)}
                    >
                      {expandedDates[date] ? 'Hide Logs' : 'Show Logs'}
                    </button>
                  </td>
                </tr>

                {/* Rows for the logs under this date */}
                {expandedDates[date] &&
                  groupedLogs[date].map((log) => (
                    <tr key={log._id} className="log-row">
                      <td colSpan="2">
                        <div>
                          <strong>Exercise:</strong> {log.exercise} |{' '}
                          <strong>Sets:</strong> {log.sets} |{' '}
                          <strong>Reps:</strong> {log.reps} |{' '}
                          <strong>Weight:</strong> {log.weight} lbs
                          <div className="log-actions mt-2">
                            <button
                              className="btn btn-primary mt-2"
                              onClick={() => onEdit(log)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-primary mt-2"
                              onClick={() => onDelete(log._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="2">No logs available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default WeightliftingLog;
