import feedparser
import datetime
from bs4 import BeautifulSoup
import boto3
import os

client = boto3.client("s3")
bucket_name = os.environ["BUCKET_NAME"]


def remove_html_tags(html_string):
    # Parse the HTML string
    soup = BeautifulSoup(html_string, "html.parser")

    # Extract the text without HTML tags
    text = soup.get_text()

    return text


def get_current_date():
    current_date = datetime.date.today()
    return str(current_date)


def convert_date(date_string):
    # Convert the input date string to a datetime object
    datetime_obj = datetime.datetime.strptime(date_string, "%a, %d %b %Y %H:%M:%S %z")

    # Format the datetime object as "YYYY-MM-DD"
    formatted_date = datetime_obj.strftime("%Y-%m-%d")

    return formatted_date


def lambda_handler(event, context):
    # Extract the RSS feed URL from the event input
    rss_feed_url = "https://aws.amazon.com/about-aws/whats-new/recent/feed/"

    # Fetch and parse the RSS feed
    feed = feedparser.parse(rss_feed_url)
    current_date = get_current_date()

    # Process the feed data
    for entry in feed.entries:
        # Convert the published date to YYYY-MM-DD format
        published_date = convert_date(entry.published)
        if published_date == current_date:
            # Remove HTML tags from the description
            description = remove_html_tags(entry.description)
            print(
                f"Title: {entry.title} \nDescription: {description} \nPublished Date: {entry.published} \nLink: {entry.link} \n"
            )

            news = f"Title: {entry.title} \nDescription: {description} \nPublished Date: {entry.published} \nLink: {entry.link} \n"

            with open(current_date + ".txt", "a") as file:
                file.write(news)

    client.upload_file(current_date + ".txt", bucket_name, current_date + ".txt")
