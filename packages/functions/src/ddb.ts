import { Entity, EntityItem } from "electrodb"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
export * as Dynamo from "./ddb"

const Client = new DynamoDBClient({});
const Service = {
    client: Client,
    table: process.env.TABLE_NAME,
};

const RecapEntity = new Entity(
    {
        model: {
            entity: "recap",
            version: "1",
            service: "awsrecap",
        },
        attributes: {
            id: {
                type: "string",
                required: true,
            },
            publishedDate: {
                type: "string",
                required: true,
            },
            recap: {
                type: "string",
                required: true,
            },
        },
        indexes: {
            primary: {
                pk: {
                    field: "pk",
                    composite: ["publishedDate"],
                }
            },
        },
    },
    Service
)

export type Info = EntityItem<typeof RecapEntity>

export async function create(input: {
    id: string
    publishedDate: string
    recap: string
}): Promise<Info> {
    try {
        const result = await RecapEntity.client
            .transactWrite({
                TransactItems: [
                    {
                        Put: RecapEntity.create({
                            ...input,
                        }).params(),
                    },
                ],
            })
            .promise()
        return result
    } catch {
        return create(input)
    }
}

export async function get(publishedDate: string) {
    const result = await RecapEntity.get({
        publishedDate,
    }).go()
    return result.data
}

const UserEntity = new Entity(
    {
        model: {
            entity: "user",
            version: "1",
            service: "awsrecap",
        },
        attributes: {
            id: {
                type: "string",
                required: true,
            },
            publishedDate: {
                type: "string",
                required: true,
            },
            recap: {
                type: "string",
                required: true,
            },
        },
        indexes: {
            primary: {
                pk: {
                    field: "pk",
                    composite: ["publishedDate"],
                }
            },
        },
    },
    Service
)