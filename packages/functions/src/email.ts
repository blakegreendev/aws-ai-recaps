import * as AWS from 'aws-sdk';
import { Dynamo } from "./ddb";
import { EmailTemplate } from './emailTemplate';
import { render } from '@react-email/render';

const ses = new AWS.SES({ region: 'us-east-1' });

export const handler = async (event: any, context: any) => {
    const emailHtml = render(EmailTemplate());

    const params = {
        Source: 'noreply@mail.blakegreen.dev',
        Destination: {
            ToAddresses: ['blakegreen@msn.com'],
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: emailHtml,
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'AWS Recap',
            },
        },
    };
    try {

        await ses.sendEmail(params).promise();
        console.log('Email sent successfully.');

    } catch (error) {
        console.error(error);
    }

};

