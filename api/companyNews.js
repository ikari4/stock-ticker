// /api/companyNews.js

export default async function handler(req, res) {
    const { symbol } = req.body;
    const date = new Date();
    const toYear = date.getFullYear();
    const toMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const toDay = date.getDate().toString().padStart(2, '0');
    const toDate = `${toYear}-${toMonth}-${toDay}`;
    
    date.setMonth(date.getMonth() - 1);
    const fromYear = date.getFullYear();
    const fromMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const fromDay = date.getDate().toString().padStart(2, '0');
    const fromDate = `${fromYear}-${fromMonth}-${fromDay}`;

    const url = "https://finnhub.io/api/v1/company-news" +
        "?symbol=" + symbol +
        "&from=" + fromDate +
        "&to=" + toDate +
        "&token=" + process.env.API_KEY;

    try {
        const response = await fetch(url);
        const data = await response.json();

        res.status(200).json(data);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch company news" });
    }
}