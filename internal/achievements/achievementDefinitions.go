package achievements

import (
	"justkile/magic-kingdom/internal/common"
	"time"
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
		Achievement: common.Achievement{Name: "Frodo", Id: 1, Description: "Ein Bier bestellt", Image: "/images/frodo.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "BEER") >= 1
		},
	},
	{
		Achievement: common.Achievement{Name: "Gandalf", Id: 2, Description: "25 Bier bestellt", Image: "/images/gandalf.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "BEER") >= 25
		},
	},
	{
		Achievement: common.Achievement{Name: "The Hound", Id: 3, Description: "15 Bier bestellt", Image: "/images/the_hound.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "BEER") >= 15
		},
	},
	{
		Achievement: common.Achievement{Name: "Alle Dirnen außer Frau Mutter", Id: 4, Description: "Holde Frau Mutter bestellt", Image: "/images/holde_frau_mutter.jpg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Holde Frau Mutter"
		},
	},
	{
		Achievement: common.Achievement{Name: "Bittersüß und Umamisalzig", Id: 5, Description: "Saueren Johannes bestellt", Image: "/images/sauer_salzig.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Saurer Johannes"
		},
	},
	{
		Achievement: common.Achievement{Name: "Lang gebraut auf der eisigen Insel", Id: 6, Description: "Eisgebräu der langen Insel bestellt", Image: "/images/eisgebraeu.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Eisgebräu der langen Insel"
		},
	},
	{
		Achievement: common.Achievement{Name: "Nicht zu schnell trinken, Verzauberungs-Gefahr!", Id: 7, Description: "MaiTaike bestellt", Image: "/images/maitaike.png"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "MaiTaike"
		},
	},
	{
		Achievement: common.Achievement{Name: "Des Gartens Unkraut fein serviert", Id: 8, Description: "Pflanzer Punsch bestellt", Image: "/images/pflanzer_punsch.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Pflanzer Punsch"
		},
	},
	{
		Achievement: common.Achievement{Name: "Hilft auch gegen Ungeziefer im Schrank", Id: 9, Description: "Minztrunk bestellt", Image: "/images/minztrunk.jpg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Minztrunk"
		},
	},
	{
		Achievement: common.Achievement{Name: "Betreten verboten!", Id: 10, Description: "Dünenbesteigung bestellt", Image: "/images/duenenbesteigung.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Dünenbesteigung"
		},
	},
	{
		Achievement: common.Achievement{Name: "Obacht! Sorgt für nachlassenden Haarwuchs", Id: 11, Description: "Moskauer Maultiersaft bestellt", Image: "/images/maultiersaft.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Moskauer Maultiersaft"
		},
	},
	{
		Achievement: common.Achievement{Name: "Ergibt gekocht einen herrlichen Kuchen", Id: 12, Description: "Weißer Rus bestellt", Image: "/images/weisser_rus.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Weißer Rus"
		},
	},
	{
		Achievement: common.Achievement{Name: "Holt die Fackeln und Mistgabeln!", Id: 13, Description: "Widergänger bestellt", Image: "/images/widergaenger.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Widergänger"
		},
	},
	{
		Achievement: common.Achievement{Name: "Kann bei übermäßigem Verzehr abführend wirken", Id: 14, Description: "Roter Sandtrank bestellt", Image: "/images/roter_sandtrank.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Roter Sandtrank"
		},
	},
	{
		Achievement: common.Achievement{Name: "Macht besonderes wachsam (Spitzbube -> Spitzel -> Spitz -> Wachhund)", Id: 15, Description: "Spitzbube bestellt", Image: "/images/spitzbube.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Spitzbube"
		},
	},
	{
		Achievement: common.Achievement{Name: "Zu empfehlen bei gutem und schlechtem Wetter", Id: 16, Description: "Dunkler Sturmtrank", Image: "/images/dunkler_sturmtrank.jpg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Dunkler Sturmtrank"
		},
	},
	{
		Achievement: common.Achievement{Name: "Willkommen in der A BRA Kada BRA", Id: 17, Description: "Tote Fichte innerhalb der ersten beiden Tage bestellt", Image: "/images/tote_fichte.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			news := last(newsList)
			firstDay := time.Date(2022, time.July, 10, 12, 0, 0, 0, time.UTC)
			secondDay := time.Date(2022, time.July, 11, 12, 0, 0, 0, time.UTC)
			return getDrinkName(news) == "Tote Fichte" && (news.CreatedAt.Day() == firstDay.Day() || news.CreatedAt.Day() == secondDay.Day())
		},
	},
	{
		Achievement: common.Achievement{Name: "Im Spiegelland auch Inorgen Ybur genannt", Id: 18, Description: "Rubinnektar bestellt", Image: "/images/ruby_negroni.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Rubinnektar"
		},
	},
	{
		Achievement: common.Achievement{Name: "Hexerei und Gaukelei liegen dicht beieinander", Id: 19, Description: "Hexer:innenbrause bestellt", Image: "/images/tschunk.png"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Hexer:innenbrause"
		},
	},
	{
		Achievement: common.Achievement{Name: "Schmecket als Obst und als Gemüse, Zaubergurke!", Id: 20, Description: "Gurkenheinrich bestellt", Image: "/images/gurkenheinrich.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Gurkenheinrich"
		},
	},
	{
		Achievement: common.Achievement{Name: "Seid ihr der König? Also ich hab euch nicht gewählt.", Id: 24, Description: "Macbeth bestellt", Image: "/images/macbeth.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return getDrinkName(last(newsList)) == "Macbeth"
		},
	},
	// are set manually
	{
		Achievement: common.Achievement{Name: "Sie kamen von hinten!", Id: 21, Description: "Turmverteidigung (leicht) gewonnen", Image: "/images/turmverteidigung_1.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return false
		},
	},
	{
		Achievement: common.Achievement{Name: "Bewahrer der Toten Fichte 2", Id: 22, Description: "Turmverteidigung (normal) gewonnen", Image: "/images/turmverteidigung_2.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return false
		},
	},
	{
		Achievement: common.Achievement{Name: "Bewahrer der Toten Fichte 3", Id: 23, Description: "Turmverteidigung (schwer) gewonnen", Image: "/images/turmverteidigung_3.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return false
		},
	},
	//
	//Ruby Negroni
	// Tschunk
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
