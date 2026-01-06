// index.js

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
    addBtn.disabled = false;
    refreshBtn.disabled = false;
    buildTable(quotes);
}

function buildTable(quotes) {
    tableDiv.innerHTML = "";
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = ["Symbol", "$", "Δ", "%Δ"];
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
        symbolLink.textContent = q.symbol;
        symbolLink.className = "symbol-link";

        symbolLink.addEventListener("click", (e) => {
            e.preventDefault();
            companyNews(q.symbol);
        });

        symbolTd.appendChild(symbolLink);
        tr.appendChild(symbolTd);

        const priceTd = document.createElement("td");
        console.log("q.c: ", q, q.c);
        priceTd.textContent = q.c.toFixed(2);
        tr.appendChild(priceTd);

        const deltaTd = document.createElement("td");
        deltaTd.textContent = q.d.toFixed(2);
        if (Number(deltaTd.textContent) > 0) {
            tr.className = "marketUp";
        } else if (Number(deltaTd.textContent < 0)) {
            tr.className = "marketDown";
        };
        tr.appendChild(deltaTd);

        const percentTd = document.createElement("td");
        percentTd.textContent = q.dp.toFixed(2) + "%";
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

async function companyNews(symbol) {
    const companyNewsRes = await fetch ("/api/companyNews", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ symbol })
    });
    const companyNews = await companyNewsRes.json();
    postNews(companyNews);
}

async function symbolCheck(addTerm) {
    addBtn.disabled = true;
    addBar.value = "";
    const checkRes = await fetch ("/api/getQuotes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ 
            symbols: [addTerm],
            validate: true 
        })
    });
    console.log("checkRes.ok: ", checkRes.ok);
    if (!checkRes.ok) {
        // add new function here to call lookup.js
        console.log("no symbol found");
        addBtn.disabled = false;
        return;
    } 
    
    addBtn.disabled = false;
    symbols.unshift(addTerm);
    console.log(symbols);
    getQuotes(symbols);    
}

const refreshBtn = document.getElementById("refreshBtn");
const addBar = document.getElementById("addBar");
const addBtn = document.getElementById("addBtn");
const stopLight = document.getElementById("stopLight");
const tableDiv = document.getElementById("tableDiv");
const newsDiv = document.getElementById("newsDiv");

const symbols = [
    "ITOT",
    "NVDA",
    "GOOGL",
    "EZU",
    "EWJ",
    "WMT",
    "VWO",
    "AMZN",
    "MSFT",
    "AAPL",
    "ABBV",
    "MTB",
    "VGK",
    "QAI",
    "ASML",
    "IWS",
    "TMO",
    "BLK",
    "ARGX",
    "QCOM",
    "TT",
    "NEE",
    "IWP",
    "MLM",
    "RDDT",
    "RF",
    "UBER",
    "HAE",
    "ALL",
    "XOM",
    "TOTL",
    "IJR",
    "UNH",
    "ROK",
    "ETN",
    "KNX",
    "KO",
    "PANW",
    "LOW",
    "TMUS",
    "SLB",
    "INDA",
    "USFD",
    "VZ",
    "SNDR",
    "WSC",
    "MA",
    "TGT",
    "COST",
    "ADI",
    "BND",
    "HUBS",
    "ICF",
    "SBAC",
    "EOG",
    "PG",
    "CI"
];

initPage(symbols);

// eventListener for refresh
refreshBtn.addEventListener("click", async () => {
    refreshBtn.disabled = true;
    tableDiv.innerHTML = "";
    initPage(symbols);
});

// eventListener for add a symbol
addBtn.addEventListener("click", async () => {    
    const addTerm = addBar.value.trim().toUpperCase();
    console.log(addTerm, symbols); 
    if (!addTerm || symbols.includes(addTerm)) return; 
    console.log("call symbolCheck");
    symbolCheck(addTerm); 
});

addBar.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addBtn.click();
    }
});
