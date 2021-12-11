package achievements

import (
	"justkile/magic-kingdom/internal/common"
)

//func (broadcaster *Broadcaster) Add(c *websocket.Conn) {
//	broadcaster.lock.Lock()
//	broadcaster.connections = append(broadcaster.connections, c)
//	broadcaster.lock.Unlock()
//}

func exists(newsList []*common.News, predicate func(news2 *common.News) bool) bool {
	for _, newsItem := range newsList {
		if predicate(newsItem) {
			return true
		}
	}
	return false
}
func last(newsList []*common.News) *common.News {
	if len(newsList) == 0 {
		return nil
	}
	return newsList[len(newsList)-1]
}
func getDrinkName(newsItem *common.News) string {
	return newsItem.Payload["drink"].(map[string]interface{})["name"].(string)
}
func getDrinkType(newsItem *common.News) string {
	return newsItem.Payload["drink"].(map[string]interface{})["drinkType"].(string)
}
func getAmount(newsItem *common.News) int {
	return int(newsItem.Payload["amount"].(float64))
}
func countTypes(newsList []*common.News, drinkType string) int {
	counter := 0
	for _, newsItem := range newsList {
		if getDrinkType(newsItem) == drinkType {
			counter = counter + getAmount(newsItem)
		}
	}
	return counter
}

var AchievementDefinitions = []*common.AchievementDefinition{
	{
		Achievement: common.Achievement{Name: "1Bier", Id: 1, Description: "Ein Bier", Image: ""},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "BEER") >= 1
		},
	}, {
		Achievement: common.Achievement{Name: "2Bier", Id: 2, Description: "Zwei Bier", Image: ""},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "BEER") >= 2
		},
	}, {
		Achievement: common.Achievement{Name: "3Bier", Id: 3, Description: "3 Bier", Image: ""},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "BEER") >= 3
		},
	},
	// 1 Bier
	// 3 Bier
	// 5 Bier
	// 10 Bier
	// 15 Bier
	// 20 Bier

	// 1 Cocktail
	// 3 Cocktail
	// 5 Cocktail
	// 10 Cocktail
	// 15 Cocktail
	// 20 Cocktail

	// 1 Softdrink
	// 3 Softdrink
	// 5 Softdrink
	// 8 Softdrink
	// 10 Softdrink

	// 10 shots auf einmal
	// Bier zwischen 8-12Uhr
	// 5 Bier + 5 Cocktails
	// 10 Bier + 10 Cocktails
	// Ein Bier und ein Kurzer innerhalb von 30 min bestellt

	// Trink spezifisch
	// Berliner Luft
	// ...

}
