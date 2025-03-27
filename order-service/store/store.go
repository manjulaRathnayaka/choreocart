package store

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/manjulaRathnayaka/choreocart/order-service/models"
)

// InMemoryStore implements a simple in-memory order store
type InMemoryStore struct {
	orders map[string]models.Order
	mutex  sync.RWMutex
	nextID int
}

// NewInMemoryStore creates a new in-memory order store
func NewInMemoryStore() *InMemoryStore {
	return &InMemoryStore{
		orders: make(map[string]models.Order),
		nextID: 1,
	}
}

// CreateOrder creates a new order from cart items
func (s *InMemoryStore) CreateOrder(items []models.CartItem) (models.Order, error) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if len(items) == 0 {
		return models.Order{}, errors.New("cannot create order with empty cart")
	}

	// Calculate total amount
	var totalAmount float64
	for _, item := range items {
		totalAmount += item.Price
	}

	// Generate order ID
	id := generateOrderID(s.nextID)
	s.nextID++

	now := time.Now()
	order := models.Order{
		ID:          id,
		Items:       items,
		TotalAmount: totalAmount,
		Status:      "pending",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// Store the order
	s.orders[id] = order
	return order, nil
}

// GetAllOrders returns all orders
func (s *InMemoryStore) GetAllOrders() []models.Order {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	orders := make([]models.Order, 0, len(s.orders))
	for _, order := range s.orders {
		orders = append(orders, order)
	}
	return orders
}

// GetOrderByID returns an order by its ID
func (s *InMemoryStore) GetOrderByID(id string) (models.Order, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	order, exists := s.orders[id]
	if !exists {
		return models.Order{}, errors.New("order not found")
	}
	return order, nil
}

// UpdateOrderStatus updates the status of an order
func (s *InMemoryStore) UpdateOrderStatus(id string, status string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	order, exists := s.orders[id]
	if !exists {
		return errors.New("order not found")
	}

	if status != "pending" && status != "completed" && status != "cancelled" {
		return errors.New("invalid order status")
	}

	order.Status = status
	order.UpdatedAt = time.Now()
	s.orders[id] = order
	return nil
}

// generateOrderID generates a simple order ID
func generateOrderID(id int) string {
	return "ORD-" + time.Now().Format("20060102") + "-" + fmt.Sprintf("%04d", id)
}
