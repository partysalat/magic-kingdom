package user

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"justkile/magic-kingdom/internal/clients"
	"justkile/magic-kingdom/internal/common"
	"log"
)

var UserPrefix = "USER"

func GetUsersFromDB(party string) ([]common.User, error) {
	resp, err := clients.GetDynamoDbClient().Query(context.TODO(), &dynamodb.QueryInput{
		TableName:              aws.String(clients.DataTableName),
		KeyConditionExpression: aws.String("PK = :hashKey and begins_with(SK,:userPrefix)"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":hashKey":    &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party)},
			":userPrefix": &types.AttributeValueMemberS{Value: common.DbFormat(UserPrefix, "")},
		},
	})
	if err != nil {
		return nil, err
	}
	var result []common.User
	err = attributevalue.UnmarshalListOfMaps(resp.Items, &result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
func AddUserToDb(party string, userName string) error {

	marshalledUser, _ := attributevalue.MarshalMap(common.User{
		PK:     common.DbFormat(common.PartyPrefix, party),
		SK:     common.DbFormat(UserPrefix, userName),
		Gsi1Pk: common.DbFormat(common.PartyPrefix, party, UserPrefix, userName),
		Gsi1Sk: common.DbFormat(UserPrefix, userName),

		Name:         userName,
		Type:         UserPrefix,
		DrinkCounts:  map[string]int{},
		Achievements: []*common.Achievement{},
	})
	_, err := clients.GetDynamoDbClient().PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName:           aws.String(clients.DataTableName),
		Item:                marshalledUser,
		ConditionExpression: aws.String("attribute_not_exists(PK) AND attribute_not_exists(SK)"),
	})
	if err != nil {
		log.Printf("failed to add user, %v", err)
		return err
	}

	return nil
}

func GetUserFromDb(party string, userId string) (*common.User, error) {
	resp, err := clients.GetDynamoDbClient().GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String(clients.DataTableName),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: common.DbFormat(common.PartyPrefix, party)},
			"SK": &types.AttributeValueMemberS{Value: userId},
		},
	})
	if err != nil {
		return nil, err
	}
	var result common.User
	err = attributevalue.UnmarshalMap(resp.Item, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}
