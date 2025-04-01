package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
	"github.com/joho/godotenv" // Add this import to load .env files
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

type DefaultExercise struct {
	Day       string   `json:"day" bson:"day"`
	Exercises []string `json:"exercises" bson:"exercises"`
}

var (
	logsCollection             *mongo.Collection
	defaultExercisesCollection *mongo.Collection
)

// Connect to MongoDB
func connectDB() {
	var mongoURI string

	// First try environment variable (for production)
	mongoURI = os.Getenv("MONGO_URI")

	// If not found, try .env file (for development)
	if mongoURI == "" {
		fmt.Println("MONGO_URI not found in environment, trying .env file...")
		err := godotenv.Load("../.env")
		if err != nil {
			err = godotenv.Load()
			if err != nil {
				fmt.Println("Error loading .env file")
				fmt.Println("Please ensure MONGO_URI is set in the environment or .env file exists")
				os.Exit(1)
			}
		}
		mongoURI = os.Getenv("MONGO_URI")
	}

	// Final check
	if mongoURI == "" {
		panic("MONGO_URI is not set in environment or .env file")
	}

	fmt.Printf("Attempting to connect to MongoDB at %s...\n",
		mongoURI[:30]+"...") // Show part of URI for debugging

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		panic(err)
	}

	err = client.Ping(context.TODO(), nil)
	if err != nil {
		panic(err)
	}

	// Initialize both collections
	logsCollection = client.Database("fitnesslog").Collection("logs")
	defaultExercisesCollection = client.Database("fitnesslog").Collection("default_exercises")
	fmt.Println("Connected to MongoDB and initialized collections!")
}

// Get all logs
func getLogs(w http.ResponseWriter, r *http.Request) {
	var logs []Log
	cursor, err := logsCollection.Find(context.TODO(), bson.M{})
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

	// Check if logs are returned
	if len(logs) == 0 {
		fmt.Println("No logs found") // Debugging message
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

	_, err := logsCollection.InsertOne(context.TODO(), log)
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

	result, err := logsCollection.DeleteOne(context.TODO(), bson.M{"_id": id})
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

	// Decode the updated log from the request body
	var updatedLog Log
	json.NewDecoder(r.Body).Decode(&updatedLog)

	// Fetch the existing log from the database
	var existingLog Log
	err := logsCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&existingLog)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Preserve the original date
	updatedLog.Date = existingLog.Date

	// Replace the document in the database
	result, err := logsCollection.ReplaceOne(context.TODO(), bson.M{"_id": id}, updatedLog)
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

// Get default exercises for a specific day
func getDefaultExercises(w http.ResponseWriter, r *http.Request) {
	day := chi.URLParam(r, "day")
	fmt.Printf("Received request for day: %s\n", day) // Debug log

	var defaultExercise DefaultExercise
	err := defaultExercisesCollection.FindOne(
		context.TODO(),
		bson.M{"day": day},
	).Decode(&defaultExercise)

	if err != nil {
		fmt.Printf("Error fetching exercises: %v\n", err) // Debug log
		if err == mongo.ErrNoDocuments {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"message": "No default exercises found for this day"})
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Printf("Sending exercises: %+v\n", defaultExercise) // Debug log
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(defaultExercise)
}

// Save or update default exercises for a specific day
func saveDefaultExercises(w http.ResponseWriter, r *http.Request) {
	var defaultExercise DefaultExercise
	err := json.NewDecoder(r.Body).Decode(&defaultExercise)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Upsert the default exercises for the given day
	filter := bson.M{"day": defaultExercise.Day}
	update := bson.M{"$set": defaultExercise}
	_, err = logsCollection.Database().Collection("default_exercises").UpdateOne(context.TODO(), filter, update, options.Update().SetUpsert(true))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Default exercises saved successfully"})
}

func main() {
	connectDB()

	r := chi.NewRouter()

	// Enable CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://18.191.252.100:3000", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Define routes
	r.Get("/logs", getLogs)
	r.Post("/logs", addLog)
	r.Delete("/logs/{id}", deleteLog)
	r.Put("/logs/{id}", updateLog)

	// Routes for default exercises
	r.Get("/default-exercises/{day}", getDefaultExercises)
	r.Post("/default-exercises", saveDefaultExercises)

	fmt.Println("Starting server on port 5000...")
	err := http.ListenAndServe("0.0.0.0:5000", r)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
