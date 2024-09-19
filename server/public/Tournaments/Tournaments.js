// Function to handle the search action and redirect to the search results page
function handleSearch(query) {
    if (query) {
        window.location.href = `../search_results/search_results.html?query=${encodeURIComponent(query)}`;
    }
}

// Add event listener to the header search bar
document.getElementById('header-search').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const query = event.target.value.trim();
        handleSearch(query);
    }
});


// Fetch and display tournaments from the "Tournament Details" sheet
fetch('/api/data?range=Tournament%20Details!A2:E')
    .then(response => response.json())
    .then(data => {
        if (data.values) {
            const tournaments = data.values.map(row => ({
                name: row[0],
                link: row[1],
                series: row[2],
                type: row[3],
                date: new Date(row[4])
            }));

            // Sort tournaments by date, newest first
            tournaments.sort((a, b) => b.date - a.date);

            displayTournaments(tournaments);
        } else {
            console.error("No data found for tournament details."); // Error: No data fetched
        }
    })
    .catch(error => console.error('Error fetching tournament details:', error));

// Display tournaments on the page
function displayTournaments(tournaments) {
    const tournamentList = document.getElementById('tournament-list');

    tournaments.forEach(tournament => {
        const tournamentItem = document.createElement('div');
        tournamentItem.classList.add('tournament-item');

        const seriesImage = getSeriesImage(tournament.series);

        tournamentItem.innerHTML = `
            <img src="${seriesImage}" alt="${tournament.series}" title="${tournament.series}">
            <div class="details">
                <h3><a href="${tournament.link}" target="_blank">${tournament.name}</a></h3>
                <p>Type: ${tournament.type}</p>
                <p>Date: ${tournament.date.toLocaleDateString()}</p>
            </div>
        `;

        tournamentList.appendChild(tournamentItem);
    });
}

// Function to get the image path based on the series name
function getSeriesImage(series) {
    const imagePath = `./Images/${series}.png`;
    return imagePath;
}
