// index.js

function initPage(symbols) {
    isMarketOpen();
    getQuotes(symbols);
    // buildTable(quotes);
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
    console.log("quotes: ", quotes);
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
    const searchTerm = searchBar.value.trim().toUpperCase();
    if (!searchTerm) return;
    if (!symbols.includes(searchTerm)) {
        symbols.push(searchTerm);
    }
    searchBar.value = "";
    getQuotes(symbols);
});
