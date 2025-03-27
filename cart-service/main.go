
package main

import (
  "encoding/json"
  "net/http"
)

var cart []map[string]interface{}

func main() {
  http.HandleFunc("/cart", func(w http.ResponseWriter, r *http.Request) {
    if r.Method == "GET" {
      json.NewEncoder(w).Encode(cart)
    } else if r.Method == "POST" {
      var item map[string]interface{}
      json.NewDecoder(r.Body).Decode(&item)
      cart = append(cart, item)
      w.WriteHeader(http.StatusCreated)
    } else if r.Method == "DELETE" {
      cart = []map[string]interface{}{}
      w.WriteHeader(http.StatusOK)
    }
  })
  http.ListenAndServe(":3002", nil)
}
