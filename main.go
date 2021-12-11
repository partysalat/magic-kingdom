package main

import (
	"fmt"
	"github.com/valyala/fasthttp"
	"justkile/magic-kingdom/internal/clients"
	"log"
)

func main() {
	clients.Init()
	fmt.Println("Starting server ")
	log.Fatal(fasthttp.ListenAndServe(":8080", GetRoutes().Handler))
}
