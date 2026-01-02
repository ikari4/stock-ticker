// index.js

function initPage() {
    const stocks = [
        "HAE",
        "NVDA",
        "GOOGL",
        "AMZN",
        "UNH",
        "MSFT"
    ];

    isMarketOpen();
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


const searchBar = document.getElementById("searchBar");
const stopLight = document.getElementById("stopLight");
const tableDiv = document.getElementById("tableDiv");
const newsDiv = document.getElementById("newsDiv");

initPage();