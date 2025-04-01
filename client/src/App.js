import React, { useState, useEffect } from "react";
import axios from "axios";
import WeightliftingLog from "./WeightliftingLog";
import AddExercise from "./AddExercise";
import "./App.css";
import BASE_URL from "./config"; // Import the BASE_URL

function App() {
  const [logs, setLogs] = useState([]);
  const [editLog, setEditLog] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [defaultExercises, setDefaultExercises] = useState(null);

  // Load logs from the backend
  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await axios.get(`${BASE_URL}:5000/logs`);
        console.log("Fetched logs:", response.data);
        setLogs(response.data || []);  // Default to an empty array if response.data is null or undefined
      } catch (error) {
        console.error("Failed to load logs:", error);
        setLogs([]);  // Set to empty array in case of error
      }
    }
    fetchLogs();
  }, []);

  // Fetch default exercises for the current day
  useEffect(() => {
    async function fetchDefaultExercises() {
      try {
        const today = new Date().toLocaleString('en-US', { weekday: 'long' });
        const response = await axios.get(`${BASE_URL}:5000/default-exercises/${today}`);
        console.log("Fetched default exercises:", response.data);
        setDefaultExercises(response.data);
      } catch (error) {
        console.error("Failed to fetch default exercises:", error);
        setDefaultExercises(null);
      }
    }
    fetchDefaultExercises();
  }, []); // Empty dependency array means this runs once when component mounts

  // Sync body background color with dark mode state
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Add a new log
  const handleAddLog = async (newLog) => {
    try {
      const response = await axios.post(`${BASE_URL}:5000/logs`, newLog);
      setLogs((prevLogs) => [...prevLogs, response.data]);
    } catch (error) {
      console.error("Failed to add log:", error);
    }
  };

  // Delete a log
  const handleDeleteLog = async (_id) => {
    try {
      await axios.delete(`${BASE_URL}:5000/logs/${_id}`);
      setLogs((prevLogs) => prevLogs.filter((log) => log._id !== _id));
    } catch (error) {
      console.error("Failed to delete log:", error);
    }
  };

  // Update a log
  const handleUpdateLog = async (updatedLog) => {
    try {
      await axios.put(`${BASE_URL}:5000/logs/${updatedLog._id}`, updatedLog);
      setLogs((prevLogs) =>
        prevLogs.map((log) => (log._id === updatedLog._id ? updatedLog : log))
      );
      setEditLog(null);
    } catch (error) {
      console.error("Failed to update log:", error);
    }
  };

  const handleEdit = async (log) => {
    if (log._id) {
      // Existing log - update
      setEditLog(log);
    } else {
      // New log - add
      try {
        const response = await axios.post(`${BASE_URL}:5000/logs`, log);
        setLogs(prevLogs => [...prevLogs, response.data]);
      } catch (error) {
        console.error("Failed to add log:", error);
      }
    }
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <div className="container">
        <h1 className="mt-4">Weightlifting Tracker</h1>
        <button onClick={toggleDarkMode} className="dark-mode-toggle">
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        <AddExercise
          onAddLog={handleAddLog}
          editLog={editLog}
          onUpdateLog={handleUpdateLog}
          darkMode={darkMode}
          defaultExercises={defaultExercises} // Pass default exercises to AddExercise
        />
        <WeightliftingLog
          logs={logs}
          onDelete={handleDeleteLog}
          onEdit={handleEdit}
          darkMode={darkMode}
          defaultExercises={defaultExercises} // Pass default exercises to WeightliftingLog
        />
      </div>
    </div>
  );
}

export default App;
