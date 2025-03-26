package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Log struct {
	ID       string `json:"_id" bson:"_id"`
	Exercise string `json:"exercise"`
	Sets     int    `json:"sets"`
	Reps     int    `json:"reps"`
	Weight   int    `json:"weight"`
	Date     string `json:"date"`
}

var collection *mongo.Collection

// Connect to MongoDB
func connectDB() {
	clientOptions := options.Client().ApplyURI("mongodb://fitnesslog-mongo-1:27017")
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		panic(err)
	}

	err = client.Ping(context.TODO(), nil)
	if err != nil {
		panic(err)
	}

	collection = client.Database("fitnesslog").Collection("logs")
	fmt.Println("Connected to MongoDB!")
}

// Get all logs
func getLogs(w http.ResponseWriter, r *http.Request) {
	var logs []Log
	cursor, err := collection.Find(context.TODO(), bson.M{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	for cursor.Next(context.TODO()) {
		var log Log
		cursor.Decode(&log)
		logs = append(logs, log)
	}

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

	_, err := collection.InsertOne(context.TODO(), log)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(log)
}

// Delete a log by ID
func deleteLog(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	result, err := collection.DeleteOne(context.TODO(), bson.M{"_id": id})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Update a log
func updateLog(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var updatedLog Log
	json.NewDecoder(r.Body).Decode(&updatedLog)

	result, err := collection.ReplaceOne(context.TODO(), bson.M{"_id": id}, updatedLog)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedLog)
}

func main() {
	connectDB()

	r := chi.NewRouter()

	// Enable CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
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
