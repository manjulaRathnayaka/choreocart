package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// CartItem represents an item in the shopping cart
type CartItem struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

// Global cart variable to store items
var cart []CartItem

// CORS middleware for handling cross-origin requests
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// handleCart handles all cart operations
func handleCart(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		// Return the current cart contents
		json.NewEncoder(w).Encode(cart)

	case http.MethodPost:
		// Add an item to the cart
		var item CartItem
		if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validate the item has required fields
		if item.ID == 0 || item.Name == "" {
			http.Error(w, "Invalid item data", http.StatusBadRequest)
			return
		}

		// Add the item to the cart
		cart = append(cart, item)
		w.WriteHeader(http.StatusCreated)

	case http.MethodDelete:
		// Clear the entire cart
		cart = []CartItem{}
		w.WriteHeader(http.StatusOK)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func main() {
	// Initialize empty cart
	cart = []CartItem{}

	// Create a new mux for routing
	mux := http.NewServeMux()

	// Register cart handler
	mux.HandleFunc("/cart", handleCart)

	// Apply CORS middleware
	handler := corsMiddleware(mux)

	// Start server
	port := 3002
	fmt.Printf("Cart service starting on port %d...\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), handler))
}
