package bootstrap

import (
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"justkile/magic-kingdom/internal/clients"
	"justkile/magic-kingdom/internal/drink"
	"justkile/magic-kingdom/internal/user"
	"log"
)

var PartyName = "magic-kingdom"

type CreateDrinkRequest struct {
	name      string
	drinkType string
}

func CreateTables() {
	// Build the request with its input parameters
	resp, err := clients.GetDynamoDbClient().ListTables(context.TODO(), &dynamodb.ListTablesInput{
		Limit: aws.Int32(100),
	})
	if err != nil {
		log.Fatalf("failed to list tables, %v", err)
	}

	if !contains(resp.TableNames, clients.DataTableName) {
		log.Println(fmt.Sprintf("Creating table:%s", clients.DataTableName))

		_, err := clients.GetDynamoDbClient().CreateTable(context.TODO(), &dynamodb.CreateTableInput{
			AttributeDefinitions: []types.AttributeDefinition{
				{
					AttributeName: aws.String("PK"),
					AttributeType: types.ScalarAttributeTypeS,
				},
				{
					AttributeName: aws.String("SK"),
					AttributeType: types.ScalarAttributeTypeS,
				},
				{
					AttributeName: aws.String("GSI1_PK"),
					AttributeType: types.ScalarAttributeTypeS,
				},
				{
					AttributeName: aws.String("GSI1_SK"),
					AttributeType: types.ScalarAttributeTypeS,
				},
			},
			KeySchema: []types.KeySchemaElement{
				{
					AttributeName: aws.String("PK"),
					KeyType:       types.KeyTypeHash,
				},
				{
					AttributeName: aws.String("SK"),
					KeyType:       types.KeyTypeRange,
				},
			},
			GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
				{
					IndexName: aws.String("GSI"),
					KeySchema: []types.KeySchemaElement{
						{
							AttributeName: aws.String("GSI1_PK"),
							KeyType:       types.KeyTypeHash,
						},
						{
							AttributeName: aws.String("GSI1_SK"),
							KeyType:       types.KeyTypeRange,
						},
					},
					Projection: &types.Projection{
						ProjectionType: types.ProjectionTypeAll,
					},
				},
			},
			BillingMode: types.BillingModePayPerRequest,
			TableName:   aws.String(clients.DataTableName),
		})
		if err != nil {
			panic(err)
		}

	}
}

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
func SeedUsersAndDrinks() {
	users := []string{
		"Felix",
		"Julia",
		"Winnii",
		"Paul B",
		"Tori",
		"Ben",
		"Jenny",
		"Nasimausi",
		"Conni",
		"Flo",
		"Sophie",
		"Benni Finger",
		"Stephanie",
		"Benni Blöckere",
		"Meike",
	}
	for _, userName := range users {
		user.AddUserToDb(PartyName, userName)
	}

	COCKTAIL := "COCKTAIL"
	BEER := "BEER"
	SHOT := "SHOT"
	SOFTDRINK := "SOFTDRINK"
	drinks := []*CreateDrinkRequest{
		{"Monkey Island Iced Tea", COCKTAIL},
		{"LeChuck's", COCKTAIL},
		{"Flensburger", BEER},
		{"Carlsberg", BEER},
		{"Berliner Luft", SHOT},
		{"Tequila", SHOT},
		{"Cola", SOFTDRINK},
		{"Fanta", SOFTDRINK},
		{"Sprite", SOFTDRINK},
	}
	for _, drinkRequest := range drinks {
		drink.AddDrinkToDb(PartyName, drinkRequest.drinkType, drinkRequest.name)
	}
	log.Printf("Bootstrapped users and drinks ")

}
