import React, { useState, useEffect } from 'react';
import './WeightliftingLog.css';

function WeightliftingLog({ logs, onDelete, onEdit, darkMode, defaultExercises }) {
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

  // Add state for default exercises
  const [currentDayExercises, setCurrentDayExercises] = useState([]);

  // Update useEffect to handle the correct data structure
  useEffect(() => {
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    console.log('Today:', today);
    console.log('Received defaultExercises:', defaultExercises);
    
    if (defaultExercises && defaultExercises.exercises) {
      console.log('Setting exercises:', defaultExercises.exercises);
      setCurrentDayExercises(defaultExercises.exercises);
    } else {
      console.log('No exercises found in defaultExercises');
    }
  }, [defaultExercises]);

  const handleAddDefaultExercise = (exercise) => {
    // Create a new log object without an _id
    const newLog = {
      exercise,
      sets: 0,
      reps: 0,
      weight: 0,
      date: new Date().toISOString().split('T')[0]
    };
    
    // Pass to parent component for handling
    onEdit(newLog);
  };

  const renderDefaultExercises = () => {
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    
    // Debug log to check what data we're receiving
    console.log('Default Exercises:', defaultExercises);
    console.log('Current Day Exercises:', currentDayExercises);

    // Check if we have exercises to display
    if (!currentDayExercises || currentDayExercises.length === 0) {
      return (
        <div className="default-exercises">
          <h4>Today's Exercises ({today})</h4>
          <p>No default exercises for today</p>
        </div>
      );
    }

    return (
      <div className="default-exercises">
        <h4>Today's Exercises ({today})</h4>
        <ul className="list-group">
          {currentDayExercises.map((exercise, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
              {exercise}
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => handleAddDefaultExercise(exercise)}
              >
                Add Log
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={`weightlifting-log ${darkMode ? 'dark' : ''}`}>
      {renderDefaultExercises()}
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
