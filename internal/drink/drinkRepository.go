package drink

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"justkile/magic-kingdom/internal/common"
	"log"

	"justkile/magic-kingdom/internal/clients"
)

var DrinkPrefix = "DRINK"
var DrinkNamePrefix = "NAME"

func GetDrinksFromDb(party string, drinkType string) ([]common.Drink, error) {
	resp, err := clients.GetDynamoDbClient().Query(context.TODO(), &dynamodb.QueryInput{
		TableName:              aws.String(clients.DataTableName),
		KeyConditionExpression: aws.String("PK = :hashKey and begins_with(SK,:prefix)"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":hashKey": &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party)},
			":prefix":  &types.AttributeValueMemberS{Value: common.DbFormat(DrinkPrefix, drinkType)},
		},
	})
	if err != nil {
		return nil, err
	}
	var result []common.Drink
	err = attributevalue.UnmarshalListOfMaps(resp.Items, &result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
func GetDrinkFromDb(party string, drinkId string) (*common.Drink, error) {
	resp, err := clients.GetDynamoDbClient().GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String(clients.DataTableName),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party)},
			"SK": &types.AttributeValueMemberS{Value: drinkId},
		},
	})
	if err != nil {
		return nil, err
	}
	var result common.Drink
	err = attributevalue.UnmarshalMap(resp.Item, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}
func AddDrinkToDb(party string, drinkType string, name string) error {
	marshalledDrink, _ := attributevalue.MarshalMap(common.Drink{
		PK:        common.DbFormat(common.PartyPrefix, party),
		SK:        common.DbFormat(DrinkPrefix, drinkType, DrinkNamePrefix, name),
		Name:      name,
		Type:      DrinkPrefix,
		DrinkType: drinkType,
	})

	_, err := clients.GetDynamoDbClient().PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName:           aws.String(clients.DataTableName),
		Item:                marshalledDrink,
		ConditionExpression: aws.String("attribute_not_exists(PK) AND attribute_not_exists(SK)"),
	})
	if err != nil {
		log.Printf("failed to add user, %v", err)
		return err
	}

	return nil
}
