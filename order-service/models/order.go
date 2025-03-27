package models

import (
	"time"
)

// CartItem represents an item in the cart
type CartItem struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

// Order represents a customer order
type Order struct {
	ID          string     `json:"id"`
	Items       []CartItem `json:"items"`
	TotalAmount float64    `json:"totalAmount"`
	Status      string     `json:"status"` // "pending", "completed", "cancelled"
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}
