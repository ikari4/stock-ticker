// index.js

let tradeSocket = null;
let currentTradeSymbol = null;
const socketKey = "d5ajr5pr01qh7ajhdrr0d5ajr5pr01qh7ajhdrrg";

function initPage() {
    isMarketOpen();
    loadFile();
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

async function loadFile() {
    const fileRes = await fetch ("/api/loadFile");
    const symbols = await fileRes.json();
    getQuotes(symbols);
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

    const portfolioChange = document.createElement("div");
    const upOrDown = weightedDp(quotes);
    portfolioChange.innerHTML = "Portfolio Change: " + upOrDown.toFixed(2) + "%";
    
    if (Number(upOrDown) > 0) {
        portfolioChange.className = "marketUp";
    } else if (Number(upOrDown) < 0) {
        portfolioChange.className = "marketDown";
    };

    socketDiv.appendChild(portfolioChange);
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

function weightedDp(data) {
    // 1) total weight
    const totalPercent = data.reduce((sum, row) => sum + row.percent, 0);

    if (totalPercent === 0) return 0;

    // 2) weighted sum
    const weightedSum = data.reduce(
        (sum, row) => sum + (row.dp * row.percent),
        0
    );

    // 3) weighted average
    return weightedSum / totalPercent;
}


const stopLight = document.getElementById("stopLight");
const infoDiv = document.getElementById("infoDiv");
const socketDiv = document.getElementById("socketDiv");
const tableDiv = document.getElementById("tableDiv");
const newsDiv = document.getElementById("newsDiv");

initPage();

