import { StackContext, Bucket, Table, Cron, NextjsSite, Function, Config, Api } from "sst/constructs";

export function AWStack({ stack }: StackContext) {
  const OPENAI_KEY = new Config.Secret(stack, "OPENAI_KEY");

  const bucket = new Bucket(stack, "Bucket");

  const table = new Table(stack, "AWSNew", {
    fields: {
      pk: "string",
      sk: "string"
    },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" },
    globalIndexes: {
      GSI1: { partitionKey: "pk", sortKey: "sk" }
    },
    timeToLiveAttribute: "expires",
    stream: true
  });

  const summarizeNews = new Function(stack, "SummarizeFunction", {
    handler: "packages/functions/src/summarize.handler",
    timeout: 300,
    bind: [bucket, table, OPENAI_KEY],
    environment: {
      BUCKET_NAME: bucket.bucketName,
      TABLE_NAME: table.tableName,
    },
  });

  bucket.addNotifications(stack, {
    mynotification: {
      function: summarizeNews,
      events: ["object_created"]
    }
  })

  const sendEmail = new Function(stack, "EmailFunction", {
    handler: "packages/functions/src/email.handler",
    timeout: 30,
    bind: [table],
    permissions: ["ses:SendEmail", "ses:SendRawEmail"],
    environment: {
      TABLE_NAME: table.tableName,
    },
  });

  table.addConsumers(stack, {
    email: sendEmail,
  });

  const getNews = new Function(stack, "RssFunction", {
    handler: "packages/functions/src/rss.handler",
    timeout: 30,
    bind: [bucket],
    environment: {
      BUCKET_NAME: bucket.bucketName,
    },
  });

  const cron = new Cron(stack, "Cron", {
    schedule: "rate(24 hours)",
    job: getNews,
  });

  const api = new Api(stack, "Api", {
    routes: {
      "GET    /recaps": "packages/functions/src/recaps.handler",
    },
  });

  const site = new NextjsSite(stack, "Site", {
    path: "packages/web",
    bind: [api],
    environment: {
      NEXT_PUBLIC_API_URL: api.url,
    },
    customDomain: {
      hostedZone: "blakegreen.dev",
      domainName: "awsrecaps.blakegreen.dev",
    },
  });

  stack.addOutputs({
    URL: site.url,
  });
}
