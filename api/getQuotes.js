// /api/getQuotes.js

export default async function handler(req, res) {
    const { symbols } = req.body;

    if (!Array.isArray(symbols) || symbols.length === 0) {
        return res.status(400).json({ error: "symbols must be a non-empty array" });
    }

    try {
        const results = await Promise.all(
            symbols.map(async (item) => {
                const symbol = typeof item === "string" ? item : item.symbol;
                if (!symbol) {
                    return { isValid: false };
                }

                const url =
                    `https://finnhub.io/api/v1/quote?symbol=${symbol}` +
                    `&token=${process.env.API_KEY}`;

                const response = await fetch(url);
                const data = await response.json();

                const isValid = data && data.c !== 0;

                return {
                    symbol,
                    isValid,
                    data: isValid ? { symbol, ...data } : null,
                    quote: isValid ? data : null,
                    meta: typeof item === "object"
                        ? {
                            name: item.name ?? null,
                            url: item.url ?? null
                        }
                        : null
                };
            })
        );

        const quotes = results
            .filter(r => r.isValid)
            .map(r => ({
                symbol: r.symbol,
                ...r.quote,
                ...(r.meta ?? {})
            }));

        res.status(200).json(quotes);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch quotes" });
    }
}

