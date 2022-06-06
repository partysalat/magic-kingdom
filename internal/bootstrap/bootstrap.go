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
		"Albrecht",
		"Vivien",
		"Simon",
		"Benjamin B.",
		"Stefan",
		"Paul",
		"Tori",
		"Benjamin F.",
		"Phil",
		"Tina",
		"Resi",
		"Stephan",
		"Robert ",
		"Jenny",
		"Dana",
		"Jens",
		"Meike",
		"Thomas",
		"Julia",
		"Ben",
		"Cornelia",
		"Nasimausi",
		"Sophie",
		"Pierre Colin",
		"Noreen",
		"Florian",
		"Schröder",
		"Felix",
		"Lea",
		"Jan",
		"Catalina",
		"Saskia",
		"Charly",
		"Winnii",
		"Tinifini Zimmer",
	}
	for _, userName := range users {
		user.AddUserToDb(PartyName, userName)
	}

	COCKTAIL := "COCKTAIL"
	COCKTAIL_DISENCHANTED := "COCKTAIL_DISENCHANTED"
	BEER := "BEER"
	SHOT := "SHOT"
	SOFTDRINK := "SOFTDRINK"
	drinks := []*CreateDrinkRequest{
		{"Holde Frau Mutter", COCKTAIL},
		{"Holde Frau Mutter (entz.)", COCKTAIL_DISENCHANTED},
		{"Saurer Johannes", COCKTAIL},
		{"Saurer Johannes (entz.)", COCKTAIL_DISENCHANTED},
		{"Gurkenheinrich", COCKTAIL},
		{"Gurkenheinrich (entz.)", COCKTAIL_DISENCHANTED},
		{"Eisgebräu der langen Insel", COCKTAIL},
		{"MaiTaike", COCKTAIL},
		{"MaiTaike (entz.)", COCKTAIL_DISENCHANTED},
		{"Pflanzer Punsch", COCKTAIL},
		{"Pflanzer Punsch (entz.)", COCKTAIL_DISENCHANTED},
		{"Minztrank", COCKTAIL},
		{"Minztrank (entz.)", COCKTAIL_DISENCHANTED},
		{"Dünenbesteigung", COCKTAIL},
		{"Dünenbesteigung (entz.)", COCKTAIL_DISENCHANTED},
		{"Moskauer Maultiersaft", COCKTAIL},
		{"Moskauer Maultiersaft (entz.)", COCKTAIL_DISENCHANTED},
		{"Weißer Rus", COCKTAIL},
		{"Weißer Rus (entz.)", COCKTAIL_DISENCHANTED},
		{"Widergänger", COCKTAIL},
		{"Macbeth", COCKTAIL},
		{"Roter Sandtrank", COCKTAIL},
		{"Roter Sandtrank (entz.)", COCKTAIL_DISENCHANTED},
		{"Spitzbube", COCKTAIL},
		{"Dunkler Sturmtrank", COCKTAIL},
		{"Dunkler Sturmtrank (entz.)", COCKTAIL_DISENCHANTED},
		{"Tote Fichte", COCKTAIL},
		{"Rubinnektar", COCKTAIL},
		{"Hexer:innenbrause", COCKTAIL},
		{"Hexer:innenbrause (entz.)", COCKTAIL_DISENCHANTED},
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
