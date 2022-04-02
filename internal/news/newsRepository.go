package news

import (
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"justkile/magic-kingdom/internal/common"
	"strconv"
	"time"

	"justkile/magic-kingdom/internal/clients"
	"log"
)

var NewsPrefix = "NEWS"
var NewsCountType = "NEWSCOUNT"
var NewsTypeDrink = "DRINK"
var NewsTypeAchievement = "ACHIEVEMENT"

func GetAllNewsFromDbFor(party string, filter string) ([]common.News, error) {
	p := dynamodb.NewQueryPaginator(clients.GetDynamoDbClient(), &dynamodb.QueryInput{
		TableName:              aws.String(clients.DataTableName),
		KeyConditionExpression: aws.String("PK = :hashKey AND begins_with(SK,:newsTypePrefix)"),
		FilterExpression:       aws.String("(:filterType = :empty OR #type = :filterType)"),
		ExpressionAttributeNames: map[string]string{
			"#type": "type",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":hashKey":        &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party)},
			":newsTypePrefix": &types.AttributeValueMemberS{Value: common.DbFormat(NewsPrefix, "")},
			":filterType":     &types.AttributeValueMemberS{Value: filter},
			":empty":          &types.AttributeValueMemberS{Value: ""},
		},
	})
	var items []common.News
	for p.HasMorePages() {
		out, err := p.NextPage(context.TODO())
		if err != nil {
			return nil, err
		}

		var pItems []common.News
		err = attributevalue.UnmarshalListOfMaps(out.Items, &pItems)
		if err != nil {
			return nil, err
		}

		items = append(items, pItems...)
	}
	return items, nil
}
func GetNewsFromDb(party string, limit int32, lastNewsId string, filter string) ([]common.News, error) {
	if lastNewsId == "" {
		lastNewsId = common.DbFormat(NewsPrefix, fmt.Sprintf("%06d", 999999))
	}
	scanIndexForward := false
	resp, err := clients.GetDynamoDbClient().Query(context.TODO(), &dynamodb.QueryInput{
		TableName:              aws.String(clients.DataTableName),
		KeyConditionExpression: aws.String("PK = :hashKey AND SK < :end"),
		FilterExpression:       aws.String("(:filterType = :empty OR #type = :filterType) AND begins_with(#type,:newsTypePrefix)"),
		ExpressionAttributeNames: map[string]string{
			"#type": "type",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":hashKey":        &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party)},
			":end":            &types.AttributeValueMemberS{Value: lastNewsId},
			":newsTypePrefix": &types.AttributeValueMemberS{Value: common.DbFormat(NewsPrefix, "")},
			":filterType":     &types.AttributeValueMemberS{Value: filter},
			":empty":          &types.AttributeValueMemberS{Value: ""},
		},
		ScanIndexForward: &scanIndexForward,
		Limit:            &limit,
	})
	if err != nil {
		log.Printf("Error %s", err.Error())
		return nil, err
	}
	var result []common.News
	err = attributevalue.UnmarshalListOfMaps(resp.Items, &result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
func GetDrinkNewsForUserFromDb(party string, userId string) ([]*common.News, error) {
	filter := common.DbFormat(NewsPrefix, NewsTypeDrink)
	p := dynamodb.NewQueryPaginator(clients.GetDynamoDbClient(), &dynamodb.QueryInput{
		TableName:              aws.String(clients.DataTableName),
		KeyConditionExpression: aws.String("GSI1_PK = :hashKey AND begins_with(GSI1_SK,:newsTypePrefix)"),
		FilterExpression:       aws.String("(:filterType = :empty OR #type = :filterType)"),
		ExpressionAttributeNames: map[string]string{
			"#type": "type",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":hashKey":        &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party, userId)},
			":newsTypePrefix": &types.AttributeValueMemberS{Value: common.DbFormat(NewsPrefix, "")},
			":filterType":     &types.AttributeValueMemberS{Value: filter},
			":empty":          &types.AttributeValueMemberS{Value: ""},
		},
		IndexName: aws.String(clients.Gsi1Name),
	})
	var items []*common.News
	for p.HasMorePages() {
		out, err := p.NextPage(context.TODO())
		if err != nil {
			return nil, err
		}

		var pItems []*common.News
		err = attributevalue.UnmarshalListOfMaps(out.Items, &pItems)
		if err != nil {
			return nil, err
		}

		items = append(items, pItems...)
	}
	return items, nil
	//secondary index read
	//return nil, nil
}

func AddNewsToDb(party string, newsType string, payload map[string]interface{}, userId string, updater types.TransactWriteItem) (*common.News, error) {

	newsCount, err2 := getNewsCount(party)
	if err2 != nil {
		return nil, err2
	}
	newsItem := &common.News{
		PK:        common.DbFormat(common.PartyPrefix, party),
		SK:        common.DbFormat(NewsPrefix, fmt.Sprintf("%06d", newsCount+1)),
		Type:      common.DbFormat(NewsPrefix, newsType),
		Payload:   payload,
		CreatedAt: time.Now(),
	}
	if userId != "" {
		newsItem.Gsi1Pk = common.DbFormat(common.PartyPrefix, party, userId)
		newsItem.Gsi1Sk = common.DbFormat(NewsPrefix, fmt.Sprintf("%06d", newsCount+1))
	}
	marshalledNewsItem, marshalErr := attributevalue.MarshalMap(newsItem)
	if marshalErr != nil {
		return nil, marshalErr
	}
	_, err := clients.GetDynamoDbClient().TransactWriteItems(context.TODO(), &dynamodb.TransactWriteItemsInput{
		TransactItems: []types.TransactWriteItem{
			{Put: &types.Put{
				TableName:           aws.String(clients.DataTableName),
				Item:                marshalledNewsItem,
				ConditionExpression: aws.String("attribute_not_exists(PK) AND attribute_not_exists(SK)"),
			}},
			{Update: &types.Update{
				Key: map[string]types.AttributeValue{
					"PK": &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party)},
					"SK": &types.AttributeValueMemberS{Value: NewsCountType},
				},
				TableName:           aws.String(clients.DataTableName),
				UpdateExpression:    aws.String("SET #c = :c"),
				ConditionExpression: aws.String("attribute_not_exists(#c) OR #c = :prevCount"),
				ExpressionAttributeNames: map[string]string{
					"#c": "count",
				},
				ExpressionAttributeValues: map[string]types.AttributeValue{
					":c":         &types.AttributeValueMemberN{Value: strconv.Itoa(newsCount + 1)},
					":prevCount": &types.AttributeValueMemberN{Value: strconv.Itoa(newsCount)},
				},
			},
			},
			updater,
		},
	})
	if err != nil {
		log.Printf("failed to add user, %v", err)
		return nil, err
	}
	log.Println(fmt.Sprintf("Adding news: %s", newsItem))

	return newsItem, nil
}

func DeleteDrinkNewsFromDb(party string, newsId string) error {
	news, err := GetNewsItemFromDb(party, newsId)
	if err != nil {
		return err
	}
	if news.PK == "" {
		return errors.New(fmt.Sprintf("News for id %s does not exists.", newsId))
	}

	if news.Type != common.DbFormat(NewsPrefix, NewsTypeDrink) {
		return errors.New("Can only delete news of type DRINK")
	}
	_, err = clients.GetDynamoDbClient().TransactWriteItems(context.TODO(), &dynamodb.TransactWriteItemsInput{
		TransactItems: []types.TransactWriteItem{
			{Delete: &types.Delete{
				TableName: aws.String(clients.DataTableName),
				Key: map[string]types.AttributeValue{
					"PK": &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party)},
					"SK": &types.AttributeValueMemberS{Value: newsId},
				},
			},
			},
			GetUpdateDrinkCountTransactItem(
				party,
				news.Payload["user"].(map[string]interface{})["SK"].(string),
				-int(news.Payload["amount"].(float64)),
				news.Payload["drink"].(map[string]interface{})["drinkType"].(string)),
		},
	},
	)
	if err != nil {
		log.Printf("failed to add user, %v", err)
		return err
	}

	return nil
}
func GetNewsItemFromDb(party string, newsId string) (*common.News, error) {
	resp, err := clients.GetDynamoDbClient().GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String(clients.DataTableName),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party)},
			"SK": &types.AttributeValueMemberS{Value: newsId},
		},
	})
	if err != nil {
		return nil, err
	}
	var result common.News
	err = attributevalue.UnmarshalMap(resp.Item, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func getNewsCount(party string) (int, error) {
	count, _ := clients.GetDynamoDbClient().GetItem(context.TODO(), &dynamodb.GetItemInput{
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party)},
			"SK": &types.AttributeValueMemberS{Value: fmt.Sprintf(NewsCountType)},
		},
		TableName: aws.String(clients.DataTableName),
		//AttributesToGet: []string{"count"},
	})
	var newsCount common.NewsCount
	unmarshalError := attributevalue.UnmarshalMap(count.Item, &newsCount)
	if unmarshalError != nil {
		return 0, unmarshalError
	}
	return newsCount.Count, nil
}

func GetUpdateDrinkCountTransactItem(party string, userId string, amount int, drinkType string) types.TransactWriteItem {
	return types.TransactWriteItem{
		Update: &types.Update{
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party)},
				"SK": &types.AttributeValueMemberS{Value: userId},
			},
			TableName:        aws.String(clients.DataTableName),
			UpdateExpression: aws.String("ADD #drinkCount.#type :c"),
			ExpressionAttributeNames: map[string]string{
				"#drinkCount": "drinkCounts",
				"#type":       drinkType,
			},
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":c": &types.AttributeValueMemberN{Value: strconv.Itoa(amount)},
			},
		},
	}
}

func GetAddAchievementTransactItem(party string, userId string, achievement *common.Achievement) types.TransactWriteItem {
	marshalledAchievementMap, _ := attributevalue.MarshalMap(achievement)
	marshalledAchievement := &types.AttributeValueMemberM{Value: marshalledAchievementMap}
	return types.TransactWriteItem{
		Update: &types.Update{
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party)},
				"SK": &types.AttributeValueMemberS{Value: userId},
			},
			TableName:        aws.String(clients.DataTableName),
			UpdateExpression: aws.String("SET #achievements = list_append(#achievements, :achievement)"),
			ExpressionAttributeNames: map[string]string{
				"#achievements": "achievements",
			},
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":achievement": &types.AttributeValueMemberL{Value: []types.AttributeValue{marshalledAchievement}},
			},
		},
	}
}
