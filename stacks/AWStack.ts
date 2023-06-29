import { StackContext, Bucket, Table, Cron, NextjsSite, Function, Config, Api } from "sst/constructs";
import * as ses from 'aws-cdk-lib/aws-ses';
import * as route53 from 'aws-cdk-lib/aws-route53';

export function AWStack({ stack }: StackContext) {
  const OPENAI_KEY = new Config.Secret(stack, "OPENAI_KEY");

  // declare const myHostedZone: route53.IPublicHostedZone;
  // const myHostedZone = route53.PublicHostedZone.fromLookup(stack, 'HostedZone', {
  //   domainName: 'blakegreen.dev',
  // });

  // const identity = new ses.EmailIdentity(stack, 'Identity', {
  //   identity: ses.Identity.publicHostedZone(myHostedZone),
  //   mailFromDomain: 'mail.blakegreen.dev',
  // });

  const bucket = new Bucket(stack, "Bucket");

  const table = new Table(stack, "AWSNew", {
    fields: {
      pk: "string",
    },
    primaryIndex: { partitionKey: "pk" },
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
  });

  stack.addOutputs({
    URL: site.url,
  });
}
