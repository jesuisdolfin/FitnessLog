import React, { useState, useEffect } from "react";
import './AddExercise.css';

function AddExercise({ onAddLog, editLog, onUpdateLog, darkMode }) {
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState(1);
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);

  // Set the form values if we're editing a log
  useEffect(() => {
    if (editLog) {
      setExercise(editLog.exercise);
      setSets(editLog.sets);
      setReps(editLog.reps);
      setWeight(editLog.weight);
    }
  }, [editLog]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLog = {
      exercise,
      sets,
      reps,
      weight,
      date: editLog ? editLog.date : new Date().toLocaleDateString(),
    };
  
    console.log("Submitting log:", newLog); // Debugging output
  
    if (editLog) {
      newLog._id = editLog._id;
      onUpdateLog(newLog);
    } else {
      onAddLog(newLog);
    }
  
    // Clear form after submitting
    setExercise("");
    setSets(1);
    setReps(0);
    setWeight(0);
  };
  

  return (
    <form onSubmit={handleSubmit} className={`form ${darkMode ? 'dark' : ''}`}>
      <div className="form-group">
        <label htmlFor="exercise">Exercise: </label>
        <input
  type="text"
  id="exercise"
  className={`form-control ${darkMode ? 'dark' : ''}`}
  value={exercise}
  onChange={(e) => setExercise(e.target.value)}
  placeholder="Enter Exercise Name"
/>

      </div>

      {/* Horizontal layout for sets, reps, and weight */}
      <div className="form-row">
        <div className="form-group col">
          <label htmlFor="sets">Sets</label>
          <div className="scroll-picker-container">
            <div className="scroll-picker">
              {[...Array(50).keys()].map((num) => (
                <div
                  key={num}
                  className={`scroll-picker-item ${sets === num + 1 ? 'selected' : ''}`}
                  onClick={() => setSets(num + 1)}
                >
                  {num + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group col">
          <label htmlFor="reps">Reps</label>
          <div className="scroll-picker-container">
            <div className="scroll-picker">
              {[...Array(50).keys()].map((num) => (
                <div
                  key={num}
                  className={`scroll-picker-item ${reps === num + 1 ? 'selected' : ''}`}
                  onClick={() => setReps(num + 1)}
                >
                  {num + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group col">
          <label htmlFor="weight">Weight (lbs)</label>
          <div className="scroll-picker-container">
            <div className="scroll-picker">
              {[...Array(1000).keys()].map((num) => (
                <div
                  key={num}
                  className={`scroll-picker-item ${weight === num + 1 ? 'selected' : ''}`}
                  onClick={() => setWeight(num + 1)}
                >
                  {num + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary mt-2">
        {editLog ? "Update Log" : "Add Log"}
      </button>
    </form>
  );
}

export default AddExercise;
