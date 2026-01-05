// /api/marketNews.js

export default async function handler(req, res) {
    const url = "https://finnhub.io/api/v1/news?category=general" +
        "&token=" + process.env.API_KEY;

    try {
        const response = await fetch(url);
        const data = await response.json();

        res.status(200).json(data);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch market news" });
    }
}