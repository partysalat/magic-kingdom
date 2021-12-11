package user

import (
	"encoding/json"
	"github.com/valyala/fasthttp"
)

type CreateUserRequest struct {
	Name string `json:"name"`
}

var PartyName = "magic-kingdom"

func GetUsers(ctx *fasthttp.RequestCtx) {
	users, _ := GetUsersFromDB(PartyName)
	result, _ := json.Marshal(users)
	ctx.Write(result)
}

func CreateUser(ctx *fasthttp.RequestCtx) {
	var result CreateUserRequest
	json.Unmarshal(ctx.PostBody(), &result)

	err := AddUserToDb(PartyName, result.Name)
	if err != nil {
		ctx.Error(err.Error(), 400)
	}

}
