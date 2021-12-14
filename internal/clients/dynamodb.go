package clients

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/aws/retry"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
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
}

func GetDynamoDbClient() *dynamodb.Client {
	return dynamodbClient
}
