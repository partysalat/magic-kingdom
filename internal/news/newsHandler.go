package news

import (
	"encoding/json"
	"fmt"
	"github.com/valyala/fasthttp"
	"justkile/magic-kingdom/internal/achievements"
	"justkile/magic-kingdom/internal/common"
	drink2 "justkile/magic-kingdom/internal/drink"
	"justkile/magic-kingdom/internal/user"
	"log"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type UserNews struct {
	Amount int    `json:"amount"`
	UserId string `json:"userId"`
}

type NewsUserDto struct {
	PK          string
	SK          string
	Name        string         `json:"name" dynamodbav:"name"`
	Type        string         `json:"type" dynamodbav:"type"`
	DrinkCounts map[string]int `json:"-" dynamodbav:"-"`
}

type CreateUsersDrinkRequest struct {
	DrinkId string     `json:"drinkId"`
	Users   []UserNews `json:"users"`
}
type CreateGameAchievementRequest struct {
	Difficulty string `json:"difficulty"`
	UserId     string `json:"userId"`
}

var PartyName = "magic-kingdom"

func GetNews(ctx *fasthttp.RequestCtx) {
	lastNewsId := string(ctx.QueryArgs().Peek("lastNewsId"))
	filter := string(ctx.QueryArgs().Peek("filter"))

	limit, limitError := ctx.QueryArgs().GetUint("limit")
	if limitError != nil {
		limit = 20
	}
	news, getNewsError := GetNewsFromDb(PartyName, int32(limit), lastNewsId, filter)
	if getNewsError != nil {
		log.Printf("Error %s", getNewsError.Error())
		ctx.Error(fmt.Sprintf("%s", getNewsError.Error()), 400)
	}

	result, _ := json.Marshal(news)
	ctx.Write(result)
}
func GetNewsAsCsv(ctx *fasthttp.RequestCtx) {

	news, getNewsError := GetAllNewsFromDbFor(PartyName, common.DbFormat(NewsPrefix, NewsTypeDrink))
	if getNewsError != nil {
		log.Printf("Error %s", getNewsError.Error())
		ctx.Error(fmt.Sprintf("%s", getNewsError.Error()), 400)
	}
	Delimiter := ","
	var headers = []string{"Name", "NewsType", "drinkName", "drinkType", "amount", "date"}
	var result = []string{strings.Join(headers[:], Delimiter)}

	for _, newsItem := range news {

		result = append(result, strings.Join([]string{
			newsItem.Payload["user"].(map[string]interface{})["name"].(string),
			newsItem.Type,
			newsItem.Payload["drink"].(map[string]interface{})["name"].(string),
			newsItem.Payload["drink"].(map[string]interface{})["drinkType"].(string),
			strconv.Itoa(int(newsItem.Payload["amount"].(float64))),
			newsItem.CreatedAt.Format(time.RFC3339),
			//TODO: add creation date
		}, Delimiter))
	}

	ctx.Response.Header.Add("Content-Type", "text/csv")
	ctx.Write([]byte(strings.Join(result, "\n")))
}
func DeleteNews(ctx *fasthttp.RequestCtx) {
	newsId, err := url.QueryUnescape(ctx.UserValue("newsId").(string))

	err = DeleteDrinkNewsFromDb(PartyName, newsId)
	if err != nil {
		log.Printf("Error while deleting news %s", err.Error())
		ctx.Error(fmt.Sprintf("%s", err.Error()), 500)
	}
	removeNews := common.RemoveNews{
		PK:        PartyName,
		SK:        newsId,
		PushType:  "REMOVE",
		CreatedAt: time.Now()}
	broadcastRemoveNews(&removeNews)
}

func CreateDrink(ctx *fasthttp.RequestCtx) {
	var createUserDrinkRequest CreateUsersDrinkRequest
	json.Unmarshal(ctx.PostBody(), &createUserDrinkRequest)
	userDrink, err := drink2.GetDrinkFromDb(PartyName, createUserDrinkRequest.DrinkId)
	if err != nil {
		ctx.Error(fmt.Sprintf("Error while getting drink: %s", err.Error()), 400)
		return
	}
	if (common.Drink{}) == *userDrink {
		ctx.Error(fmt.Sprintf("No Drink found for id %s %s", PartyName, createUserDrinkRequest.DrinkId), 400)
		return
	}
	for _, userNews := range createUserDrinkRequest.Users {
		userDto, err := user.GetUserFromDb(PartyName, userNews.UserId)
		if err != nil {
			ctx.Error(fmt.Sprintf("No usr found %s", err.Error()), 400)
			return
		}
		if userDto.PK == "" {
			ctx.Error(fmt.Sprintf("No user found for id %s %s", PartyName, userNews.UserId), 400)
			return
		}
		// Didn't find a way to exclude this field in news
		userDto.DrinkCounts = nil
		userDto.Achievements = nil
		payload := map[string]interface{}{
			"drink":  userDrink,
			"user":   userDto,
			"amount": userNews.Amount,
		}

		news, err := AddNewsToDb(PartyName, NewsTypeDrink, payload, userDto.SK, GetUpdateDrinkCountTransactItem(PartyName, userDto.SK, userNews.Amount, userDrink.DrinkType))
		if err != nil {
			ctx.Error(err.Error(), 400)
			return
		}
		go broadcast(news)

		//TODO optimize, maybe like this https://stackoverflow.com/questions/68359637/fire-and-forget-goroutine-golang
		//https://spiralscout.com/blog/understanding-concurrency-and-parallelism-in-golang
		checkAchievementsForUserAndBroadcast(userDto)

	}

}
func CreateGameAchievement(ctx *fasthttp.RequestCtx) {
	var createGameAchievementRequest CreateGameAchievementRequest
	json.Unmarshal(ctx.PostBody(), &createGameAchievementRequest)
	userDto, err := user.GetUserFromDb(PartyName, createGameAchievementRequest.UserId)
	var wannabeAchievement = getAchievementWithId(21)
	if createGameAchievementRequest.Difficulty == "normal" {
		wannabeAchievement = getAchievementWithId(22)
	} else if createGameAchievementRequest.Difficulty == "hard" {
		wannabeAchievement = getAchievementWithId(23)
	}
	if err != nil {
		ctx.Error(fmt.Sprintf("Error while getting drink: %s", err.Error()), 400)
		return
	}
	if contains(userDto.Achievements, wannabeAchievement.Id) {
		return
	}

	achievementPayload := map[string]interface{}{
		"achievement": wannabeAchievement,
		"user":        userDto,
	}

	achievementNews, err := AddNewsToDb(PartyName, NewsTypeAchievement, achievementPayload, userDto.SK, GetAddAchievementTransactItem(PartyName, userDto.SK, wannabeAchievement))
	if err != nil {
		log.Printf("Cannot add achievements news: %s", err.Error())
		return
	}
	broadcast(achievementNews)
}

func checkAchievementsForUserAndBroadcast(userDto *common.User) {
	newsList, err := GetDrinkNewsForUserFromDb(PartyName, userDto.SK)
	if err != nil {
		log.Printf("Cannot get news: %s", err.Error())
		return
	}

	reachedAchievements := achievements.CheckForNewAchievement(PartyName, userDto.SK, newsList)
	for _, reachedAchievement := range reachedAchievements {
		achievementPayload := map[string]interface{}{
			"achievement": reachedAchievement,
			"user":        userDto,
		}

		achievementNews, err := AddNewsToDb(PartyName, NewsTypeAchievement, achievementPayload, userDto.SK, GetAddAchievementTransactItem(PartyName, userDto.SK, reachedAchievement))
		if err != nil {
			log.Printf("Cannot add achievements news: %s", err.Error())
			return
		}
		broadcast(achievementNews)
	}

}

func broadcast(news *common.News) {
	newsMarshalled, _ := json.Marshal(news)
	b.Broadcast(newsMarshalled)
}
func broadcastRemoveNews(news *common.RemoveNews) {
	newsMarshalled, _ := json.Marshal(news)
	b.Broadcast(newsMarshalled)
}

func contains(s []*common.Achievement, e int) bool {
	for _, a := range s {
		if a.Id == e {
			return true
		}
	}
	return false
}
func getAchievementWithId(e int) *common.Achievement {
	for _, a := range achievements.AchievementDefinitions {
		if a.Achievement.Id == e {
			return &a.Achievement
		}
	}
	return nil
}
