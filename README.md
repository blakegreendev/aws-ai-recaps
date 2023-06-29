[![Edit in Eraser](https://firebasestorage.googleapis.com/v0/b/second-petal-295822.appspot.com/o/images%2Fgithub%2FOpen%20in%20Eraser.svg?alt=media&token=968381c8-a7e7-472a-8ed6-4a6626da5501)](https://app.eraser.io/workspace/eQgSQLKSsCbQvsnZrZlR)
Keep up with AWS news using AI to send an email every day with a summary of all the announcements.

## Requirements
- Schedule a lambda function to get the AWS what's new feed.
- Save data with time stamp in S3.
- S3 object notification triggers another lambda function to call OpenAI to summarize the text and then store in DynamoDB
- User signs up with Clerk - store the users email in DynamoDB.
- Send an email with the summarized content 
    - User react email with SES - [﻿https://react.email/docs/integrations/aws-ses](https://react.email/docs/integrations/aws-ses) 
## Diagram
[﻿Figure 1 and more](https://app.eraser.io/workspace/eQgSQLKSsCbQvsnZrZlR?elements=QzKAkojeS-rZacLkI9yGBA) 

 




<!--- Eraser file: https://app.eraser.io/workspace/eQgSQLKSsCbQvsnZrZlR --->