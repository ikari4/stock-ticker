// /api/getQuotes.js

export default async function handler(req, res) {
    const { symbols } = req.body;
console.log("symbols: ", symbols);
    if (!Array.isArray(symbols)) {
        return res.status(400).json({ error: "symbols must be an array" });
    }

    try {
        const quotes = await Promise.all(
            symbols.map(async (symbol) => {
                const url =
                    `https://finnhub.io/api/v1/quote?symbol=${symbol}` +
                    `&token=${process.env.API_KEY}`;

                const response = await fetch(url);
                const data = await response.json();

                return { symbol, ...data };
            })
        );

        res.status(200).json(quotes);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch quotes" });
    }
}
