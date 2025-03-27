
package main

import (
  "encoding/json"
  "net/http"
)

type Product struct {
  ID    int     `json:"id"`
  Name  string  `json:"name"`
  Price float64 `json:"price"`
}

func main() {
  http.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
    products := []Product{
      {ID: 1, Name: "Laptop", Price: 999.99},
      {ID: 2, Name: "Phone", Price: 499.99},
    }
    json.NewEncoder(w).Encode(products)
  })
  http.ListenAndServe(":3001", nil)
}
