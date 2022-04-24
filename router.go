package main

import (
	"github.com/fasthttp/router"
	"github.com/valyala/fasthttp"

	"justkile/magic-kingdom/internal/drink"

	"justkile/magic-kingdom/internal/news"
	"justkile/magic-kingdom/internal/user"
)

func GetRoutes() *router.Router {
	r := router.New()
	r.GET("/api/users", user.GetUsers)
	r.POST("/api/users", user.CreateUser)

	r.GET("/api/drinks/{drinkType}", drink.GetDrinks)
	r.POST("/api/drinks/{drinkType}", drink.CreateDrink)

	r.GET("/api/news", news.GetNews)
	r.GET("/api/news/csv", news.GetNewsAsCsv)
	r.PUT("/api/users", news.CreateDrink)
	r.POST("/api/achievement/game", news.CreateGameAchievement)
	r.DELETE("/api/news/{newsId}", news.DeleteNews)

	r.GET("/api/ws", news.WsHandler)

	r.GET("/api/bestlist", user.GetUsers)
	fs := &fasthttp.FS{
		Root:       "./frontend/build",
		IndexNames: []string{"index.html"},
		PathNotFound: func(ctx *fasthttp.RequestCtx) {
			ctx.SendFile("./frontend/build/index.html")
		},

		GenerateIndexPages: true,
		AcceptByteRange:    true,
	}

	r.GET("/{rest:*}", fs.NewRequestHandler())

	return r
}
