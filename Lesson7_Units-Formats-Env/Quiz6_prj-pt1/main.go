package main

import (
	"net/http"
)

func main() {
	//http.HandleFunc("/", index)
	//http.Handle("/images", http.FileServer(http.Dir(.)))
	http.ListenAndServe(":8080", http.FileServer(http.Dir(".")))
}
