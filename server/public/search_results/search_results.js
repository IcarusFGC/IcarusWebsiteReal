// Constants for Google Sheets API
const sheetId = '1ynGZgQuvDnrBVq_vpNhCFxM0kxlSykFuRVOzCRSO9-M';
const apiKey = 'AIzaSyBZMGrx13oqpIoGQdALhdvVlFnGFkW31Do';
const range = 'PlayerDetails!A2:G';

const searchInput = document.getElementById('search-input');
const resultsList = document.getElementById('results-list');

// Function to get URL parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Function to fetch player data from Google Sheets
async function fetchData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.values;
}

// Function to render search results
function renderResults(players) {
    resultsList.innerHTML = '';

    players.forEach(player => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `../player_details/player_details.html?player=${encodeURIComponent(player[0])}`;
        link.textContent = player[0];
        li.appendChild(link);
        resultsList.appendChild(li);
    });
}

// Function to filter players based on search query
function filterPlayers(players, query) {
    return players.filter(player => player[0].toLowerCase().includes(query.toLowerCase()));
}

// Perform search when the page loads based on URL query parameter
async function performSearchOnPageLoad() {
    const query = getQueryParam('query');
    if (query) {
        searchInput.value = query; // Set the search input to the query
        const players = await fetchData();
        const filteredPlayers = filterPlayers(players, query);
        renderResults(filteredPlayers);
    } else {
        const players = await fetchData();
        renderResults(players);
    }
}

// Event listener for search input
searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim();
    if (query.length > 0) {
        const players = await fetchData();
        const filteredPlayers = filterPlayers(players, query);
        renderResults(filteredPlayers);
    } else {
        resultsList.innerHTML = ''; // Clear results if search query is empty
    }
});

// Initial search when the page loads
performSearchOnPageLoad();
