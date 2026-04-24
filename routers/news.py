from fastapi import APIRouter
import httpx
import os
from dotenv import load_dotenv

router = APIRouter()

# Load env variables
load_dotenv()

API_KEY = os.getenv("NEWS_API_KEY")

# -------------------------------
# Get Top Headlines
# -------------------------------
@router.get("/")
async def get_news():
    url = f"https://newsapi.org/v2/everything?q=technology&sortBy=publishedAt&apiKey={API_KEY}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    data = response.json()

    articles = [
    {
        "title": article["title"],
        "source": article["source"]["name"],
        "url": article["url"],
        "image": article["urlToImage"]
    }
    for article in data.get("articles", [])[:10]   # 👈 LIMIT TO 10
]

    return {"articles": articles}