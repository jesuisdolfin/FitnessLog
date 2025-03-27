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

  // Load logs from the backend
  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await axios.get(`${BASE_URL}:5000/logs`);
        setLogs(response.data);
      } catch (error) {
        console.error("Failed to load logs:", error);
      }
    }
    fetchLogs();
  }, []);

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
        />
        <WeightliftingLog
          logs={logs}
          onDelete={handleDeleteLog}
          onEdit={setEditLog}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

export default App;
