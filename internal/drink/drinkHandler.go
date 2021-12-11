package drink

import (
	"encoding/json"
	"github.com/valyala/fasthttp"
)

type CreateDrinkRequest struct {
	Name string `json:"name"`
}

var PartyName = "magic-kingdom"

func GetDrinks(ctx *fasthttp.RequestCtx) {
	drinkType := ctx.UserValue("drinkType").(string)
	users, _ := GetDrinksFromDb(PartyName, drinkType)
	result, _ := json.Marshal(users)
	ctx.Write(result)
}
func CreateDrink(ctx *fasthttp.RequestCtx) {
	drinkType := ctx.UserValue("drinkType").(string)
	var result CreateDrinkRequest
	json.Unmarshal(ctx.PostBody(), &result)

	err := AddDrinkToDb(PartyName, drinkType, result.Name)
	if err != nil {
		ctx.Error(err.Error(), 400)
	}

}
