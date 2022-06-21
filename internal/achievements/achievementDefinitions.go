package achievements

import (
	"justkile/magic-kingdom/internal/common"
	"strings"
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
func getAtReverse(newsList []*common.News, index int) *common.News {
	if len(newsList) <= index {
		return nil
	}
	return newsList[len(newsList)-1-index]
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
	}, {
		Achievement: common.Achievement{Name: "Geralt von Riva", Id: 2, Description: "5 Bier bestellt", Image: "/images/beer05.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "BEER") >= 5
		},
	}, {
		Achievement: common.Achievement{Name: "Conan, der Barbar", Id: 3, Description: "10 Bier bestellt", Image: "/images/beer10.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "BEER") >= 10
		},
	}, {
		Achievement: common.Achievement{Name: "Tyrion Lannister", Id: 4, Description: "15 Bier bestellt", Image: "/images/beer15.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "BEER") >= 15
		},
	},
	{
		Achievement: common.Achievement{Name: "Gandalf", Id: 5, Description: "20 Bier bestellt", Image: "/images/gandalf.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "BEER") >= 20
		},
	},
	{
		Achievement: common.Achievement{Name: "Alchemistenlehrling", Id: 10, Description: "1 Cocktail bestellt", Image: "/images/cocktail1.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "COCKTAIL")+countTypes(newsList, "COCKTAIL_DISENCHANTED") >= 1
		},
	},
	{
		Achievement: common.Achievement{Name: "Geselle der moderaten Trankbraukünste", Id: 11, Description: "5 Cocktail bestellt", Image: "/images/cocktail5.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "COCKTAIL")+countTypes(newsList, "COCKTAIL_DISENCHANTED") >= 5
		},
	}, {
		Achievement: common.Achievement{Name: "Trank'ster", Id: 12, Description: "10 Cocktail bestellt", Image: "/images/cocktail10.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "COCKTAIL")+countTypes(newsList, "COCKTAIL_DISENCHANTED") >= 10
		},
	},
	{
		Achievement: common.Achievement{Name: "Senior Trankbrauer", Id: 13, Description: "15 Cocktail bestellt", Image: "/images/cocktail15.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "COCKTAIL")+countTypes(newsList, "COCKTAIL_DISENCHANTED") >= 15
		},
	},
	{
		Achievement: common.Achievement{Name: "Meister der Alchemie", Id: 14, Description: "20 Cocktail bestellt", Image: "/images/cocktail20.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "COCKTAIL")+countTypes(newsList, "COCKTAIL_DISENCHANTED") >= 20
		},
	},
	{
		Achievement: common.Achievement{Name: "Küken", Id: 20, Description: "1 Softdrink bestellt", Image: "/images/softdrink1.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "SOFTDRINK") >= 1
		},
	},
	{
		Achievement: common.Achievement{Name: "Lämmchen", Id: 21, Description: "5 Softdrinks bestellt", Image: "/images/softdrink5.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "SOFTDRINK") >= 5
		},
	},
	{
		Achievement: common.Achievement{Name: "Ferkel", Id: 22, Description: "10 Softdrinks bestellt", Image: "/images/softdrink10.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "SOFTDRINK") >= 10
		},
	},
	{
		Achievement: common.Achievement{Name: "Kälbchen", Id: 23, Description: "15 Softdrinks bestellt", Image: "/images/softdrink15.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "SOFTDRINK") >= 15
		},
	},
	{
		Achievement: common.Achievement{Name: "Fohlen", Id: 24, Description: "20 Softdrink bestellt", Image: "/images/softdrink20.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return countTypes(newsList, "SOFTDRINK") >= 20
		},
	},
	{
		Achievement: common.Achievement{Name: "Hoch die Tassen", Id: 30, Description: "10 Shots auf einmal bestellt", Image: "/images/hoch_die_tassen.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			currentNews := last(newsList)
			return getDrinkType(currentNews) == "SHOT" && getAmount(currentNews) >= 15
		},
	},
	{
		Achievement: common.Achievement{Name: "Dorffestveranstalter", Id: 32, Description: "15 Shots auf einmal bestellt", Image: "/images/dorffest.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			currentNews := last(newsList)
			return getDrinkType(currentNews) == "SHOT" && getAmount(currentNews) >= 10
		},
	},
	{
		Achievement: common.Achievement{Name: "Der frühe Vogel hat einen Wurm", Id: 31, Description: "Bier zwischen 8-12 Uhr morgens", Image: "/images/fruehervogel.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			currentNews := last(newsList)
			now := time.Now()
			t1 := time.Date(now.Year(), now.Month(), now.Day(), 7, 0, 0, 0, now.Location())
			t2 := time.Date(now.Year(), now.Month(), now.Day(), 11, 0, 0, 0, now.Location())
			return getDrinkType(currentNews) == "BEER" && now.After(t1) && now.Before(t2)
		},
	},
	{
		Achievement: common.Achievement{Name: "Wiederholung ist die Mutter der Zauberkiste", Id: 31, Description: "3x nacheinander denselben Drink bestellt", Image: "/images/zauberkiste.jpg"},
		Predicate: func(newsList []*common.News) bool {
			currentNews := last(newsList)
			currentNews1 := getAtReverse(newsList, 1)
			currentNews2 := getAtReverse(newsList, 2)
			if currentNews2 == nil || currentNews1 == nil || currentNews == nil {
				return false
			}
			return getDrinkName(currentNews) == getDrinkName(currentNews1) && getDrinkName(currentNews2) == getDrinkName(currentNews1)
		},
	},

	// Trink spezifisch
	// Berliner Luft
	// ...
	{
		Achievement: common.Achievement{Name: "Alle Dirnen außer Frau Mutter", Id: 100, Description: "Holde Frau Mutter bestellt", Image: "/images/holde_frau_mutter.jpg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Holde Frau Mutter")
		},
	},
	{
		Achievement: common.Achievement{Name: "Bittersüß und Umamisalzig", Id: 101, Description: "Saueren Johannes bestellt", Image: "/images/sauer_salzig.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Saurer Johannes")
		},
	},
	{
		Achievement: common.Achievement{Name: "Lang gebraut auf der eisigen Insel", Id: 102, Description: "Eisgebräu der langen Insel bestellt", Image: "/images/eisgebraeu.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Eisgebräu der langen Insel")
		},
	},
	{
		Achievement: common.Achievement{Name: "Nicht zu schnell trinken, Verzauberungs-Gefahr!", Id: 103, Description: "MaiTaike bestellt", Image: "/images/maitaike.png"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "MaiTaike")
		},
	},
	{
		Achievement: common.Achievement{Name: "Des Gartens Unkraut fein serviert", Id: 104, Description: "Pflanzer Punsch bestellt", Image: "/images/pflanzer_punsch.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Pflanzer Punsch")
		},
	},
	{
		Achievement: common.Achievement{Name: "Hilft auch gegen Ungeziefer im Schrank", Id: 105, Description: "Minztrank bestellt", Image: "/images/minztrunk.jpg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Minztrank")
		},
	},
	{
		Achievement: common.Achievement{Name: "Betreten verboten!", Id: 106, Description: "Dünenbesteigung bestellt", Image: "/images/duenenbesteigung.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Dünenbesteigung")
		},
	},
	{
		Achievement: common.Achievement{Name: "Obacht! Sorgt für nachlassenden Haarwuchs", Id: 107, Description: "Moskauer Maultiersaft bestellt", Image: "/images/maultiersaft.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Moskauer Maultiersaft")
		},
	},
	{
		Achievement: common.Achievement{Name: "Ergibt gekocht einen herrlichen Kuchen", Id: 108, Description: "Weißer Rus bestellt", Image: "/images/weisser_rus.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Weißer Rus")
		},
	},
	{
		Achievement: common.Achievement{Name: "Holt die Fackeln und Mistgabeln!", Id: 109, Description: "Widergänger bestellt", Image: "/images/widergaenger.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Widergänger")
		},
	},
	{
		Achievement: common.Achievement{Name: "Kann bei übermäßigem Verzehr abführend wirken", Id: 110, Description: "Roter Sandtrank bestellt", Image: "/images/roter_sandtrank.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Roter Sandtrank")
		},
	},
	{
		Achievement: common.Achievement{Name: "Macht besonderes wachsam (Spitzbube -> Spitzel -> Spitz -> Wachhund)", Id: 111, Description: "Spitzbube bestellt", Image: "/images/spitzbube.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Spitzbube")
		},
	},
	{
		Achievement: common.Achievement{Name: "Zu empfehlen bei gutem und schlechtem Wetter", Id: 112, Description: "Dunkler Sturmtrank", Image: "/images/dunkler_sturmtrank.jpg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Dunkler Sturmtrank")
		},
	},
	{
		Achievement: common.Achievement{Name: "Willkommen in der A BRA Kada BRA", Id: 113, Description: "Tote Fichte innerhalb der ersten beiden Tage bestellt", Image: "/images/tote_fichte.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			news := last(newsList)
			firstDay := time.Date(2022, time.July, 10, 12, 0, 0, 0, time.UTC)
			secondDay := time.Date(2022, time.July, 11, 12, 0, 0, 0, time.UTC)
			return getDrinkName(news) == "Tote Fichte" && (news.CreatedAt.Day() == firstDay.Day() || news.CreatedAt.Day() == secondDay.Day())
		},
	},
	{
		Achievement: common.Achievement{Name: "Im Spiegelland auch Inorgen Ybur genannt", Id: 114, Description: "Rubinnektar bestellt", Image: "/images/ruby_negroni.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Rubinnektar")
		},
	},
	{
		Achievement: common.Achievement{Name: "Hexerei und Gaukelei liegen dicht beieinander", Id: 115, Description: "Hexer:innenbrause bestellt", Image: "/images/tschunk.png"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Hexer:innenbrause")
		},
	},
	{
		Achievement: common.Achievement{Name: "Schmecket als Obst und als Gemüse, Zaubergurke!", Id: 116, Description: "Gurkenheinrich bestellt", Image: "/images/gurkenheinrich.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Gurkenheinrich")
		},
	},
	{
		Achievement: common.Achievement{Name: "Seid ihr der König? Also ich hab euch nicht gewählt.", Id: 117, Description: "Macbeth bestellt", Image: "/images/macbeth.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return strings.Contains(getDrinkName(last(newsList)), "Macbeth")
		},
	},

	// are set manually
	{
		Achievement: common.Achievement{Name: "Bewahrer der Toten Fichte", Id: 200, Description: "Turmverteidigung (leicht) gewonnen", Image: "/images/turmverteidigung_1.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return false
		},
	},
	{
		Achievement: common.Achievement{Name: "Ich seh den Wald vor lauter Toter Fichten nicht mehr", Id: 201, Description: "Turmverteidigung (normal) gewonnen", Image: "/images/turmverteidigung_2.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return false
		},
	},
	{
		Achievement: common.Achievement{Name: "Endlich abgesägt und weiterverarbeitet", Id: 202, Description: "Turmverteidigung (schwer) gewonnen", Image: "/images/turmverteidigung_3.jpeg"},
		Predicate: func(newsList []*common.News) bool {
			return false
		},
	},
}
