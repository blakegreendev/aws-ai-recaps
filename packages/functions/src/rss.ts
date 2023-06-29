import Parser from 'rss-parser';
import * as fs from 'fs';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();
const bucketName = process.env.BUCKET_NAME as string;

type CustomFeed = { aws: string };
type CustomItem = { title: string, link: string, pubDate: string, contentSnippet: string };

const parser: Parser<CustomFeed, CustomItem> = new Parser({
    customFields: {
        item: ['title', 'link', 'pubDate', 'contentSnippet']
    }
});

function getCurrentDate(): string {
    const currentDate = new Date().toISOString().slice(0, 10);
    return currentDate;
}

function convertDate(dateString: string): string {
    const dateTime = new Date(dateString);
    const formattedDate = dateTime.toISOString().slice(0, 10);
    return formattedDate;
}

function writeToTextFile(filePath: string, text: string): void {
    fs.appendFileSync(filePath, text);
}

async function uploadFile(bucketName: string, fileKey: string, filePath: string): Promise<void> {
    const fileContent = await readFile(filePath);

    const params: AWS.S3.Types.PutObjectRequest = {
        Bucket: bucketName,
        Key: fileKey,
        Body: fileContent
    };

    await s3.upload(params).promise();
    console.log(`File uploaded successfully to S3 bucket: ${bucketName}`);
}

async function readFile(filePath: string): Promise<Buffer> {
    const fs = require('fs').promises;
    const fileContent = await fs.readFile(filePath);
    return fileContent;
}

export const handler = async (event: any, context: any): Promise<void> => {
    const rssFeedUrl = 'https://aws.amazon.com/about-aws/whats-new/recent/feed/';
    const currentDateString = getCurrentDate();
    try {
        const feed = await parser.parseURL(rssFeedUrl);
        feed.items.forEach(async (item) => {
            const publishedDate = convertDate(item.pubDate);

            if (publishedDate === currentDateString) {
                const news = `Title: ${item.title}\nDescription: ${item.contentSnippet}\nPublished Date: ${item.pubDate}\nLink: ${item.link}\n`;
                console.log(news)
                writeToTextFile(`${currentDateString}.txt`, news);
            }
        })
        uploadFile(bucketName, `${currentDateString}.txt`, `${currentDateString}.txt`);
    } catch (error) {
        console.error(error);
    }
};



