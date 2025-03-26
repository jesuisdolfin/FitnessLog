package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"github.com/go-chi/cors"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

)

type Log struct {
	ID      string `json:"_id"`
	Exercise string `json:"exercise"`
	Sets    int    `json:"sets"`
	Reps    int    `json:"reps"`
	Weight  int    `json:"weight"`
	Date    string `json:"date"`
}


var logs = []Log{} // Initialize logs as an empty slice

// Get all logs
func getLogs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}

// Add a new log
func addLog(w http.ResponseWriter, r *http.Request) {
	var log Log
	json.NewDecoder(r.Body).Decode(&log)

	if log.ID == "" {
		log.ID = uuid.New().String()
	}

	logs = append(logs, log)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(log)
}


// Delete a log by ID
func deleteLog(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	for i, log := range logs {
		if log.ID == id {
			logs = append(logs[:i], logs[i+1:]...)
			w.WriteHeader(http.StatusOK)
			return
		}
	}
	w.WriteHeader(http.StatusNotFound)
}

// Update a log
func updateLog(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var updatedLog Log
	json.NewDecoder(r.Body).Decode(&updatedLog)

	for i, log := range logs {
		if log.ID == id {
			logs[i] = updatedLog
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(updatedLog)
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
}

func main() {
	r := chi.NewRouter()

	// Enable CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Adjust for frontend origin
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	}))

	r.Get("/logs", getLogs)
	r.Post("/logs", addLog)
	r.Delete("/logs/{id}", deleteLog)
	r.Put("/logs/{id}", updateLog)

	fmt.Println("Starting server on port 5000...")
	err := http.ListenAndServe(":5000", r)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
