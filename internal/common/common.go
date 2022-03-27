package common

import "time"

var PartyPrefix = "PARTY"

type News struct {
	PK        string                 `json:"party"`
	SK        string                 `json:"newsId"`
	Gsi1Pk    string                 `json:"-" dynamodbav:"GSI1_PK"`
	Gsi1Sk    string                 `json:"-" dynamodbav:"GSI1_SK"`
	Type      string                 `json:"type" dynamodbav:"type"`
	Payload   map[string]interface{} `json:"payload" dynamodbav:"payload"`
	CreatedAt time.Time              `json:"createdAt" dynamodbav:"createdAt"`
}
type RemoveNews struct {
	PK        string    `json:"party"`
	SK        string    `json:"newsId"`
	PushType  string    `json:"pushType"`
	CreatedAt time.Time `json:"createdAt"`
}
type NewsCount struct {
	PK    string `json:"party"`
	SK    string `json:"newsId"`
	Count int    `json:"count"`
}

type Achievement struct {
	Id          int    `json:"id" dynamodbav:"id"`
	Name        string `json:"name" dynamodbav:"name"`
	Description string `json:"description" dynamodbav:"description"`
	Image       string `json:"image" dynamodbav:"image"`
}
type AchievementDefinition struct {
	Achievement Achievement
	Predicate   func([]*News) bool
}

type User struct {
	PK     string
	SK     string
	Gsi1Pk string `json:"-" dynamodbav:"GSI1_PK"`
	Gsi1Sk string `json:"-" dynamodbav:"GSI1_SK"`

	Name         string         `json:"name" dynamodbav:"name"`
	Type         string         `json:"type" dynamodbav:"type"`
	DrinkCounts  map[string]int `json:"drinkCounts" dynamodbav:"drinkCounts"`
	Achievements []*Achievement `json:"achievements" dynamodbav:"achievements"`
}
type NewsUser struct {
	PK     string
	SK     string
	Gsi1Pk string `json:"-" dynamodbav:"-"`
	Gsi1Sk string `json:"-" dynamodbav:"-"`

	Name         string         `json:"name" dynamodbav:"name"`
	Type         string         `json:"type" dynamodbav:"type"`
	DrinkCounts  map[string]int `json:"-" dynamodbav:"-"`
	Achievements []*Achievement `json:"-" dynamodbav:"-"`
}
type Drink struct {
	PK        string
	SK        string
	Name      string `json:"name" dynamodbav:"name"`
	Type      string `json:"type" dynamodbav:"type"`
	DrinkType string `json:"drinkType" dynamodbav:"drinkType"`
}
