package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/manjulaRathnayaka/choreocart/order-service/handlers"
	"github.com/manjulaRathnayaka/choreocart/order-service/store"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Initialize store
	orderStore := store.NewInMemoryStore()

	// Initialize handler
	orderHandler := handlers.NewOrderHandler(orderStore)

	// Create a new mux
	mux := http.NewServeMux()

	// Set up routes - combine the GET and PATCH handling for /orders/ in one handler
	mux.HandleFunc("/orders", orderHandler.GetOrders)
	mux.HandleFunc("/order", orderHandler.CreateOrder) // For compatibility with BFF API

	// Combined handler for both GET and PATCH operations on /orders/{id}
	mux.HandleFunc("/orders/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			orderHandler.GetOrders(w, r)
		case http.MethodPatch:
			orderHandler.UpdateOrderStatus(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	// Apply CORS middleware
	handler := corsMiddleware(mux)

	// Start server
	port := 3003
	fmt.Printf("Order service starting on port %d...\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), handler))
}
