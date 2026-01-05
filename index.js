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
    searchBtn.disabled = false;
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
        priceTd.textContent = q.c.toFixed(2);
        tr.appendChild(priceTd);

        const deltaTd = document.createElement("td");
        deltaTd.textContent = q.d.toFixed(2);
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
        // .filter(article => article.source === "CNBC")
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


const searchBar = document.getElementById("searchBar");
const searchBtn = document.getElementById("searchBtn");
const stopLight = document.getElementById("stopLight");
const tableDiv = document.getElementById("tableDiv");
const newsDiv = document.getElementById("newsDiv");

const symbols = [
    "HAE",
    "NVDA",
    "GOOGL",
    "AMZN",
    "UNH",
    "MSFT"
];

initPage(symbols);

// eventListener for search for symbol
searchBtn.addEventListener("click", async () => {
    searchBtn.disabled = true;
    const searchTerm = searchBar.value.trim().toUpperCase();
    if (!searchTerm) return;
    if (!symbols.includes(searchTerm)) {
        symbols.push(searchTerm);
    }
    searchBar.value = "";
    getQuotes(symbols);
});

searchBar.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});
