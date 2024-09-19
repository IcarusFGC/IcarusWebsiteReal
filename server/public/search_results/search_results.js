const searchInput = document.getElementById('search-input');
const resultsList = document.getElementById('results-list');

// Function to get URL parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Function to fetch player data from the server-side API
async function fetchData() {
    try {
        const response = await fetch('/api/data?range=Player%20Details!A2:G'); // Fetch data from server-side API
        const data = await response.json();
        return data.values || []; // Return data values or an empty array if undefined
    } catch (error) {
        console.error('Error fetching data:', error);
        return []; // Return an empty array in case of error
    }
}

// Function to render search results
function renderResults(players) {
    resultsList.innerHTML = ''; // Clear existing results

    players.forEach(player => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `../player_details/player_details.html?player=${encodeURIComponent(player[0])}`; // Construct URL with player name
        link.textContent = player[0]; // Display player name
        li.appendChild(link);
        resultsList.appendChild(li); // Append the link to the list
    });
}

// Function to filter players based on search query
function filterPlayers(players, query) {
    return players.filter(player => player[0].toLowerCase().includes(query.toLowerCase())); // Filter by player name
}

// Perform search when the page loads based on URL query parameter
async function performSearchOnPageLoad() {
    const query = getQueryParam('query'); // Get 'query' parameter from URL
    const players = await fetchData(); // Fetch data from server-side API

    if (query) {
        searchInput.value = query; // Set the search input to the query
        const filteredPlayers = filterPlayers(players, query); // Filter players based on the query
        renderResults(filteredPlayers); // Render filtered results
    } else {
        renderResults(players); // Render all players if no query is provided
    }
}

// Event listener for search input
searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim(); // Get and trim the search input value
    const players = await fetchData(); // Fetch data from server-side API

    if (query.length > 0) {
        const filteredPlayers = filterPlayers(players, query); // Filter players based on the input
        renderResults(filteredPlayers); // Render filtered results
    } else {
        resultsList.innerHTML = ''; // Clear results if search query is empty
    }
});

// Initial search when the page loads
performSearchOnPageLoad();
