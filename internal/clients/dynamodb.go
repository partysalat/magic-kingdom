package clients

import (
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/aws/retry"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"log"
	"os"
)

var (
	awsRegion   string
	awsEndpoint string

	dynamodbClient *dynamodb.Client
)
var DataTableName = "magic-kingdom-accounting"
var Gsi1Name = "GSI"

func Init() {
	//os.LookupEnv
	awsRegion = "eu-west-1" //os.Getenv("AWS_REGION")||
	if os.Getenv("AWS_ENDPOINT") == "" {
		awsEndpoint = "http://localhost:8000"
	} else {
		awsEndpoint = os.Getenv("AWS_ENDPOINT")
	}

	customResolver := aws.EndpointResolverFunc(func(service, region string) (aws.Endpoint, error) {
		if awsEndpoint != "" {
			return aws.Endpoint{
				PartitionID:   "aws",
				URL:           awsEndpoint,
				SigningRegion: awsRegion,
			}, nil
		}

		// returning EndpointNotFoundError will allow the service to fallback to it's default resolution
		return aws.Endpoint{}, &aws.EndpointNotFoundError{}
	})

	awsCfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(awsRegion),
		config.WithRetryer(func() aws.Retryer {
			return retry.AddWithMaxAttempts(retry.NewStandard(), 20)
		}),
		config.WithEndpointResolver(customResolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("xxx", "xxx", "XXX")),
	)
	if err != nil {
		log.Fatalf("Cannot load the AWS configs: %s", err)
	}
	dynamodbClient = dynamodb.NewFromConfig(awsCfg)
	createTables()
}
func createTables() {
	// Build the request with its input parameters
	resp, err := dynamodbClient.ListTables(context.TODO(), &dynamodb.ListTablesInput{
		Limit: aws.Int32(100),
	})
	if err != nil {
		log.Fatalf("failed to list tables, %v", err)
	}

	if !contains(resp.TableNames, DataTableName) {
		log.Println(fmt.Sprintf("Creating table:%s", DataTableName))

		_, err := dynamodbClient.CreateTable(context.TODO(), &dynamodb.CreateTableInput{
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
			TableName:   aws.String(DataTableName),
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

func GetDynamoDbClient() *dynamodb.Client {
	return dynamodbClient
}
