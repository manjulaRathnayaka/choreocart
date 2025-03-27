package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
)

type Product struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Description string  `json:"description,omitempty"`
	Category    string  `json:"category,omitempty"`
}

var products = []Product{
	{ID: 1, Name: "Laptop", Price: 999.99, Description: "High performance laptop", Category: "Electronics"},
	{ID: 2, Name: "Phone", Price: 499.99, Description: "Smartphone with great camera", Category: "Electronics"},
	{ID: 3, Name: "Headphones", Price: 99.99, Description: "Noise cancelling headphones", Category: "Audio"},
	{ID: 4, Name: "Coffee Maker", Price: 79.99, Description: "Automatic coffee machine", Category: "Kitchen"},
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func handleProducts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	// Extract path components
	pathParts := strings.Split(r.URL.Path, "/")

	// If we have a product ID in the URL
	if len(pathParts) > 2 && pathParts[2] != "" {
		productID, err := strconv.Atoi(pathParts[2])
		if err != nil {
			http.Error(w, "Invalid product ID", http.StatusBadRequest)
			return
		}

		// Find the product with the matching ID
		for _, product := range products {
			if product.ID == productID {
				json.NewEncoder(w).Encode(product)
				return
			}
		}

		// If no product found with that ID
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	// Handle search functionality
	if r.URL.Path == "/products/search" {
		query := r.URL.Query().Get("query")
		category := r.URL.Query().Get("category")

		var results []Product

		for _, product := range products {
			// Match by name (case insensitive contains)
			nameMatch := query == "" || strings.Contains(
				strings.ToLower(product.Name),
				strings.ToLower(query),
			)

			// Match by category if provided
			categoryMatch := category == "" || product.Category == category

			if nameMatch && categoryMatch {
				results = append(results, product)
			}
		}

		json.NewEncoder(w).Encode(results)
		return
	}

	// Return all products if no specific ID or search
	json.NewEncoder(w).Encode(products)
}

func main() {
	mux := http.NewServeMux()

	// Register handlers
	mux.HandleFunc("/products", handleProducts)
	mux.HandleFunc("/products/", handleProducts)

	// Apply CORS middleware
	handler := corsMiddleware(mux)

	// Start server
	port := 3001
	fmt.Printf("Product service starting on port %d...\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), handler))
}
