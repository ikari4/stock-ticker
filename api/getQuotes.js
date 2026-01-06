// /api/getQuotes.js

export default async function handler(req, res) {
    const { symbols, validate = false } = req.body;

    if (!Array.isArray(symbols) || symbols.length === 0) {
        return res.status(400).json({ error: "symbols must be a non-empty array" });
    }

    try {
        const results = await Promise.all(
            symbols.map(async (symbol) => {
                const url =
                    `https://finnhub.io/api/v1/quote?symbol=${symbol}` +
                    `&token=${process.env.API_KEY}`;

                const response = await fetch(url);
                const data = await response.json();

                const isValid = data && data.c !== 0;

                return {
                    symbol,
                    isValid,
                    data: isValid ? { symbol, ...data } : null
                };
            })
        );

        // 🔴 Validation mode (used by symbolCheck)
        if (validate) {
            const invalid = results.find(r => !r.isValid);
            if (invalid) {
                return res.status(404).json({
                    error: `Symbol not found: ${invalid.symbol}`
                });
            }
        }

        // 🟢 Normal mode (used by getQuotes)
        const quotes = results
            .filter(r => r.isValid)
            .map(r => r.data);

        res.status(200).json(quotes);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch quotes" });
    }
}

