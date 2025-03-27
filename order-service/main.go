
package main

import (
  "encoding/json"
  "net/http"
)

func main() {
  http.HandleFunc("/order", func(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{
      "message": "Order placed successfully!",
    })
  })
  http.ListenAndServe(":3003", nil)
}
