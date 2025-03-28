package models

import (
	"time"
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

// Order represents a customer order
type Order struct {
	ID          string     `json:"id"`
	Items       []CartItem `json:"items"`
	TotalAmount float64    `json:"totalAmount"`
	Status      string     `json:"status"` // "pending", "completed", "cancelled"
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}
