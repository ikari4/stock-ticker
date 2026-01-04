// index.js

function initPage(symbols) {
    isMarketOpen();
    getQuotes(symbols);
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
        symbolTd.textContent = q.symbol;
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
