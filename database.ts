import {
  CreateTableCommand,
  CreateTableInput,
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({
  region: "us-east-1",
});
const tableName = "GoldPrices";

const createTableParams: CreateTableInput = {
  TableName: tableName,
  KeySchema: [
    { AttributeName: "date", KeyType: "HASH" }, // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: "date", AttributeType: "S" }, // Date is a string
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
};

export const createTableIfNotExists = async () => {
  try {
    await dynamoDBClient.send(new CreateTableCommand(createTableParams));
    console.log(`Table ${tableName} created successfully.`);
  } catch (error) {
    const typedError = error as Error;
    if (typedError.name !== "ResourceInUseException") {
      console.error("Error creating table:", typedError);
    } else {
      console.log(`Table ${tableName} already exists.`);
    }
  }
};

export const uploadToDynamoDB = async (mergedRates: {
  [date: string]: { [currency: string]: number };
}) => {
  const isTableEmpty = await isDynamoDBTableEmpty();

  // If the table is not empty, skip the upload process
  if (!isTableEmpty) {
    console.log("DynamoDB table is not empty. Skipping upload.");
    return;
  } else {
    console.log("DynamoDB table is empty. Uploading.");
    // DynamoDB table is empty, proceed with uploading data
    for (const [date, rates] of Object.entries(mergedRates)) {
      const params = {
        TableName: tableName,
        Item: {
          date: { S: date },
          price: { N: rates.XAU.toString() },
        },
      };

      try {
        await dynamoDBClient.send(new PutItemCommand(params));
        console.log(`Gold price for ${date} uploaded to DynamoDB`);
      } catch (error) {
        console.error(
          `Error uploading gold price for ${date} to DynamoDB:`,
          error
        );
        throw error;
      }
    }
  }
};

export const isDynamoDBTableEmpty = async (): Promise<boolean> => {
  try {
    const command = new ScanCommand({ TableName: tableName });
    const { Items } = await dynamoDBClient.send(command);
    return !Items || Items.length === 0;
  } catch (error) {
    console.error("Error checking DynamoDB table status:", error);
    throw error;
  }
};

export const getAllDataFromDynamoDB = async () => {
  try {
    const scanParams = {
      TableName: tableName,
    };

    const command = new ScanCommand(scanParams);
    const { Items } = await dynamoDBClient.send(command);

    return Items;
  } catch (error) {
    console.error("Error fetching data from DynamoDB:", error);
    throw error;
  }
};
