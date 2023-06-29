import { OpenAI } from "langchain/llms/openai";
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";
import * as AWS from 'aws-sdk';
import { Config } from "sst/node/config";
import { Dynamo } from "./ddb";
import { v4 as uuid } from "uuid";

const s3 = new AWS.S3();
const bucketName = process.env.BUCKET_NAME as string;

function getCurrentDate(): string {
    const currentDate = new Date().toISOString().slice(0, 10);
    return currentDate;
}

async function downloadFile(bucketName: string, fileKey: string, localFilePath: string): Promise<void> {
    const params: AWS.S3.Types.GetObjectRequest = {
        Bucket: bucketName,
        Key: fileKey
    };

    const fileStream = fs.createWriteStream(localFilePath);

    const response = await s3.getObject(params).promise();

    console.log(`File downloaded successfully to local path: ${localFilePath}`);
}

export const handler = async (event: any, context: any): Promise<void> => {

    try {
        process.env.OPENAI_API_KEY = Config.OPENAI_KEY;
        const currentDate = getCurrentDate();
        downloadFile(bucketName, `${currentDate}.txt`, `${currentDate}.txt`)
        const text = fs.readFileSync(`${currentDate}.txt`, "utf8");
        const model = new OpenAI({ temperature: 0 });
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
        const docs = await textSplitter.createDocuments([text]);

        // This convenience function creates a document chain prompted to summarize a set of documents.
        const chain = loadSummarizationChain(model, { type: "map_reduce" });
        const res = await chain.call({
            input_documents: docs,
        });
        // console.log({ res.text });
        // Put in DynamoDB
        const id = uuid().slice(0, 8);
        const data = {
            id,
            publishedDate: currentDate,
            recap: res.text,
        }
        await Dynamo.create(data);

    } catch (error) {
        console.error(error);
    }

};

