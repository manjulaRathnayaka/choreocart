package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/manjulaRathnayaka/choreocart/order-service/models"
	"github.com/manjulaRathnayaka/choreocart/order-service/store"
)

// OrderHandler handles order-related HTTP requests
type OrderHandler struct {
	store *store.InMemoryStore
}

// NewOrderHandler creates a new order handler
func NewOrderHandler(store *store.InMemoryStore) *OrderHandler {
	return &OrderHandler{
		store: store,
	}
}

// CreateOrder handles creating a new order
func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	// Parse the request body to get cart items
	var items []models.CartItem
	if err := json.NewDecoder(r.Body).Decode(&items); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create the order
	order, err := h.store.CreateOrder(items)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Return the created order
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(order)
}

// GetOrders handles retrieving orders
func (h *OrderHandler) GetOrders(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	// Check if this is a request for a specific order
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) > 2 && pathParts[2] != "" {
		// Get a specific order by ID
		orderID := pathParts[2]
		order, err := h.store.GetOrderByID(orderID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(order)
		return
	}

	// Return all orders
	orders := h.store.GetAllOrders()
	json.NewEncoder(w).Encode(orders)
}

// UpdateOrderStatus handles updating the status of an order
func (h *OrderHandler) UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	// Extract order ID from path
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 3 {
		http.Error(w, "Invalid order ID", http.StatusBadRequest)
		return
	}
	orderID := pathParts[2]

	// Parse request body to get the new status
	var requestBody struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update the order status
	err := h.store.UpdateOrderStatus(orderID, requestBody.Status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get the updated order
	order, err := h.store.GetOrderByID(orderID)
	if err != nil {
		http.Error(w, "Error retrieving updated order", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(order)
}
