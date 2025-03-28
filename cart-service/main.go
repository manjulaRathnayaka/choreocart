package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// CartItem represents an item in the shopping cart
type CartItem struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity,omitempty"`
	Category    string  `json:"category,omitempty"`
	Description string  `json:"description,omitempty"`
}

// Global cart variable to store items
var cart []CartItem

// CORS middleware for handling cross-origin requests
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

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
		// Add item to cart
		var item CartItem
		if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validate required fields
		if item.ID == 0 || item.Name == "" || item.Price <= 0 {
			http.Error(w, "Invalid item data", http.StatusBadRequest)
			return
		}

		// Set quantity to 1 if not provided
		if item.Quantity <= 0 {
			item.Quantity = 1
		}

		// Check if the item already exists in the cart
		for i, existingItem := range cart {
			if item.ID == existingItem.ID {
				// Update quantity instead of adding new item
				cart[i].Quantity += item.Quantity
				w.WriteHeader(http.StatusCreated)
				return
			}
		}

		// Add new item to cart
		cart = append(cart, item)
		w.WriteHeader(http.StatusCreated)

	case http.MethodPut:
		// Replace the entire cart
		var newCart []CartItem
		if err := json.NewDecoder(r.Body).Decode(&newCart); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validate all items
		for i, item := range newCart {
			if item.ID == 0 || item.Name == "" {
				http.Error(w, "Invalid item data", http.StatusBadRequest)
				return
			}
			// Ensure quantity is at least 1
			if newCart[i].Quantity <= 0 {
				newCart[i].Quantity = 1
			}
		}

		// Replace cart
		cart = newCart
		w.WriteHeader(http.StatusOK)

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
