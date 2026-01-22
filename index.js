// index.js

let tradeSocket = null;
let currentTradeSymbol = null;
const socketKey = "d5ajr5pr01qh7ajhdrr0d5ajr5pr01qh7ajhdrrg";

function initPage(symbols) {
    isMarketOpen();
    getQuotes(symbols);
    marketNews();
}

async function isMarketOpen() {
    const openRes = await fetch ("/api/isMarketOpen");
    const isOpen = await openRes.json();
    if (isOpen.isOpen) {
        stopLight.classList.add("open");
    } else {
        stopLight.classList.remove("open");
    }
}

async function getQuotes(symbols) {
    const quoteRes = await fetch ("/api/getQuotes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ symbols })
    })
    const quotes = await quoteRes.json();
    buildTable(quotes);
}

function buildTable(quotes) {
    tableDiv.innerHTML = "";
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = ["Name", "$", "%Δ"];
    headers.forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    quotes.forEach(q => {
        const tr = document.createElement("tr");

        const symbolTd = document.createElement("td");
        const symbolLink = document.createElement("a");
        symbolLink.href = "#";
        symbolLink.textContent = q.name;
        symbolLink.className = "symbol-link";

        symbolLink.addEventListener("click", (e) => {
            e.preventDefault();
            companyNews(q.symbol);
            companyInfo(q.symbol, quotes);
            realTimeTrades(q.symbol);
        });

        symbolTd.appendChild(symbolLink);
        tr.appendChild(symbolTd);

        const priceTd = document.createElement("td");
        priceTd.textContent = q.c.toFixed(2);
        tr.appendChild(priceTd);

        const percentTd = document.createElement("td");
        percentTd.textContent = q.dp.toFixed(2) + "%";

        if (Number(q.dp) > 0) {
            tr.className = "marketUp";
        } else if (Number(q.dp) < 0) {
            tr.className = "marketDown";
        };

        tr.appendChild(percentTd);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableDiv.appendChild(table);
}

async function marketNews() {
    const marketNewsRes = await fetch ("/api/marketNews");
    const marketNews = await marketNewsRes.json();
    postNews(marketNews);
}

function postNews(newsToPost) {

    newsDiv.innerHTML = "";

    newsToPost
        .slice(0, 10)
        .forEach(article => {
            const card = document.createElement("div");
            card.className = "news-card";

            if (article.image) {
                const img = document.createElement("img");
                img.src = article.image;
                img.alt = article.headline;
                img.className = "news-image";
                card.appendChild(img);
            }

            const headline = document.createElement("a");
            headline.href = article.url;
            headline.target = "_blank";
            headline.rel = "noopener noreferrer";
            headline.textContent = article.headline;
            headline.className = "news-headline";
            card.appendChild(headline);

            newsDiv.appendChild(card);
    });
}

function postInfo(companyInfo) {
    infoDiv.innerHTML = "";

    if (
        !companyInfo ||
        Object.keys(companyInfo).length === 0 ||
        !companyInfo.name
    ) {
        const fallback = document.createElement("div");
        fallback.className = "company-fallback";
        fallback.textContent = "No company profile available (ETF or index).";
        infoDiv.appendChild(fallback);
        return;
    }

    const header = document.createElement("div");
    header.className = "company-header";

    if (companyInfo.logo) {
        const logo = document.createElement("img");
        logo.src = companyInfo.logo;
        logo.alt = companyInfo.name;
        logo.className = "company-logo";
        header.appendChild(logo);
    }

    const nameLink = document.createElement("a");
    nameLink.href = companyInfo.weburl;
    nameLink.target = "_blank";
    nameLink.rel = "noopener noreferrer";
    nameLink.textContent = companyInfo.name;
    nameLink.className = "company-name";

    header.appendChild(nameLink);

    if (companyInfo.finnhubIndustry) {
        const industry = document.createElement("div");
        industry.textContent = companyInfo.finnhubIndustry;
        industry.className = "company-industry";
        infoDiv.appendChild(header);
        infoDiv.appendChild(industry);
    } else {
        infoDiv.appendChild(header);
    }
}

async function companyNews(symbol) {
    const companyNewsRes = await fetch ("/api/companyNews", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ symbol })
    });
    const companyNews = await companyNewsRes.json();
    postNews(companyNews);
}

async function companyInfo(symbol, quotes) {
    const companyInfoRes = await fetch ("/api/companyInfo", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ symbol })
    });

    let companyInfo = await companyInfoRes.json();
    if (!companyInfo || !companyInfo.name) {
        const fallback = quotes.find(q => q.symbol === symbol);
        if (fallback) {
            companyInfo = {
                name: fallback.name || symbol, // fallback to symbol if name missing
                weburl: fallback.url || null,
                logo: fallback.logo || null,
                finnhubIndustry: fallback.finnhubIndustry || null,
                country: fallback.country || null,
                currency: fallback.currency || null,
                estimateCurrency: fallback.estimateCurrency || null,
                exchange: fallback.exchange || null,
                ipo: fallback.ipo || null,
                marketCapitalization: fallback.marketCapitalization || null,
                phone: fallback.phone || null,
                shareOutstanding: fallback.shareOutstanding || null
            };
        }
    }
    postInfo(companyInfo);
}

function realTimeTrades(symbol) {
    if (!tradeSocket) {
        tradeSocket = new WebSocket(
            `wss://ws.finnhub.io?token=${socketKey}`
        );
        tradeSocket.onopen = () => {
            console.log("WebSocket connected");
            socketDiv.textContent = "Waiting for next trade";

            tradeSocket.send(JSON.stringify({
                type: "subscribe",
                symbol: symbol
            }));

            currentTradeSymbol = symbol;
        };

        tradeSocket.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            if (msg.type === "trade") {
                const trade = msg.data[0];
                const sym = trade.s;
                const price = trade.p.toFixed(2);
                const volume = trade.v;

                socketDiv.innerHTML = `
                    <span class="trade-symbol">${sym}</span>
                    <span class="trade-price">$${price}</span>
                    <span class="trade-volume">Vol: ${volume}</span>
                `;
                console.log("LIVE TRADE: ", trade);
            }
        };

        tradeSocket.onerror = (err) => {
            console.error("WebSocket error", err);
        };

        return;
    }

    if (currentTradeSymbol) {
        tradeSocket.send(JSON.stringify({
            type: "unsubscribe",
            symbol: currentTradeSymbol
        }));
    }

    tradeSocket.send(JSON.stringify({
        type: "subscribe",
        symbol: symbol
    }));

    currentTradeSymbol = symbol;
    socketDiv.textContent = "Waiting for next trade";
}

const stopLight = document.getElementById("stopLight");
const infoDiv = document.getElementById("infoDiv");
const socketDiv = document.getElementById("socketDiv");
const tableDiv = document.getElementById("tableDiv");
const newsDiv = document.getElementById("newsDiv");

const symbols = [
        {"symbol": "ITOT", "name": "iShares Core S&P Total US Stock Market ETF", "url": "https://www.ishares.com/us/products/239724/ishares-core-sp-total-us-stock-market-etf"},
        {"symbol": "NVDA", "name": "NVIDIA"},
        {"symbol": "GOOGL", "name": "Alphabet"},
        {"symbol": "EZU", "name": "iShares MSCI Eurozone ETF", "url": "https://www.ishares.com/us/products/239644/ishares-msci-emu-etf"},
        {"symbol": "EWJ","name": "iShares MSCI Japan ETF", "url": "https://www.ishares.com/us/products/239665/ishares-msci-japan-etf"},
        {"symbol": "WMT","name": "Walmart"},
        {"symbol": "VWO","name": "Vanguard Emerging Markets Stock Index Fund ETF", "url": "https://investor.vanguard.com/investment-products/etfs/profile/vwo"},
        {"symbol": "AMZN","name": "Amazon"},
        {"symbol": "MSFT","name": "Microsoft"},
        {"symbol": "AAPL","name": "Apple"},
        {"symbol": "ABBV","name": "AbbVie"},
        {"symbol": "MTB","name": "M&T Bank"},
        {"symbol": "VGK", "name": "Vanguard European Stock Index Fund ETF", "url": "https://investor.vanguard.com/investment-products/etfs/profile/vgk"},
        {"symbol": "QAI", "name": "NYLI Hedge Multi-Strategy Tracker ETF", "url": "https://www.newyorklifeinvestments.com/etf/nyli-hedge-multi-strategy-tracker-etf-qai?ticker=QAI"},
        {"symbol": "ASML","name": "ASML Holding NV"},
        {"symbol": "IWS", "name": "iShares Russell Mid-Cap Value ETF", "url": "https://www.ishares.com/us/products/239719/ishares-russell-midcap-value-etf"},
        {"symbol": "TMO","name": "Thermo Fisher Scientific"},
        {"symbol": "BLK","name": "Blackrock"},
        {"symbol": "ARGX","name": "argenx SE"},
        {"symbol": "QCOM","name": "Qualcomm"},
        {"symbol": "TT","name": "Trane Technologies"},
        {"symbol": "NEE","name": "Nextera Engery"},
        {"symbol": "IWP", "name": "iShares Russell Mid-Cap Growth ETF", "url": "https://www.ishares.com/us/products/239717/ishares-russell-midcap-growth-etf"},
        {"symbol": "MLM","name": "Martin Marietta Materials"},
        {"symbol": "RDDT","name": "Reddit"},
        {"symbol": "RF","name": "Regions Financial"},
        {"symbol": "UBER","name": "Uber Technologies"},
        {"symbol": "HAE","name": "Haemonetics"},
        {"symbol": "ALL","name": "Allstate"},
        {"symbol": "XOM","name": "Exxon Mobil"},
        {"symbol": "TOTL", "name": "State Street SPDR DoubleLine Tot Rtn Tctl ETF", "url": "https://www.ssga.com/us/en/individual/etfs/state-street-doubleline-total-return-tactical-etf-totl"},
        {"symbol": "IJR", "name": "iShares Core S&P Small-Cap ETF", "url": "https://www.ishares.com/us/products/239774/ishares-core-sp-smallcap-etf"},
        {"symbol": "UNH","name": "United Health Group"},
        {"symbol": "ROK","name": "Rockwell Automation"},
        {"symbol": "ETN","name": "Eaton Corporation"},
        {"symbol": "KNX","name": "Knight-Swift Transportation Holdings"},
        {"symbol": "KO","name": "Coca-Cola"},
        {"symbol": "PANW","name": "Palo Alto Networks"},
        {"symbol": "LOW","name": "Lowes Companies"},
        {"symbol": "TMUS","name": "T-Mobile US"},
        {"symbol": "SLB","name": "Slb NV"},
        {"symbol": "INDA", "name": "iShares MSCI India ETF", "url": "https://www.ishares.com/us/products/239659/ishares-msci-india-etf"},
        {"symbol": "USFD","name": "US Foods Holding"},
        {"symbol": "VZ","name": "Verizon Communications"},
        {"symbol": "SNDR","name": "Schneider National"},
        {"symbol": "WSC","name": "WillScot Holdings"},
        {"symbol": "MA","name": "Mastercard"},
        {"symbol": "TGT","name": "Target"},
        {"symbol": "COST","name": "CostCo Wholesale"},
        {"symbol": "ADI","name": "Analog Devices"},
        {"symbol": "BND", "name": "Vanguard Total Bond Market Index Fund ETF", "url": "https://investor.vanguard.com/investment-products/etfs/profile/bnd"},
        {"symbol": "HUBS","name": "Hubspot"},
        {"symbol": "ICF", "name": "iShares Select US REIT ETF", "url": "https://www.ishares.com/us/products/239482/ishares-cohen-steers-reit-etf"},
        {"symbol": "SBAC","name": "SBA Communications"},
        {"symbol": "EOG","name": "EOG Resources"},
        {"symbol": "PG","name": "Proctor & Gamble"},
        {"symbol": "CI","name": "Cigna Group"}
    ];

initPage(symbols);

