const urlParams = new URLSearchParams(window.location.search);
const playerName = urlParams.get('player'); // Get player name from URL

const playerNameElement = document.getElementById('player-name');
const playerEloElement = document.getElementById('player-elo');
const playerRankElement = document.getElementById('player-rank');
const matchHistoryContainer = document.getElementById('match-history-container');
const totalWinsElement = document.getElementById('total-wins');
const totalLossesElement = document.getElementById('total-losses');
const winRateElement = document.getElementById('win-rate');

let matchHistoryData = [];
let totalWins = 0;
let totalLosses = 0;
let playerID = '';

// Fetch player details based on player name from the server
fetch(`/api/data?range=Player%20Details!A2:G`)
    .then(response => response.json())
    .then(data => {
        if (data.values) {
            const rows = data.values;
            console.log('Fetched player details:', rows); // Debug: Show fetched data

            // Find the player row by matching the player name
            const playerRow = rows.find(row => row[0].trim() === playerName.trim()); // Match by player name

            if (playerRow) {
                playerNameElement.textContent = playerRow[0]; // Display player name
                playerID = playerRow[1]; // Extract player ID (discriminator)
                const onlineElo = parseInt(playerRow[2], 10);
                const offlineElo = parseInt(playerRow[3], 10);
                const icarusElo = parseInt(playerRow[4], 10);
                playerEloElement.textContent = `Online Elo: ${onlineElo} | Offline Elo: ${offlineElo} | Icarus Elo: ${icarusElo}`;

                // Sort players by Icarus Elo in descending order
                const sortedPlayers = rows.sort((a, b) => parseInt(b[4], 10) - parseInt(a[4], 10));

                // Find the player's rank by Icarus Elo
                const playerRank = sortedPlayers.findIndex(row => row[0].trim() === playerName.trim()) + 1;
                playerRankElement.textContent = `(Rank: ${playerRank})`;

                // Update total wins and losses
                totalWins = parseInt(playerRow[5], 10);
                totalLosses = parseInt(playerRow[6], 10);
                totalWinsElement.textContent = totalWins;
                totalLossesElement.textContent = totalLosses;
                const totalMatches = totalWins + totalLosses;
                const winRate = totalMatches ? ((totalWins / totalMatches) * 100).toFixed(2) : 0;
                winRateElement.textContent = `${winRate}%`;

                // Fetch match history now that we have the player ID
                fetchMatchHistory();
            } else {
                console.error("Player not found in player details."); // Error: Player not found
            }
        } else {
            console.error("No data found for player details."); // Error: No data fetched
        }
    })
    .catch(error => console.error('Error fetching player details:', error));

// Fetch match history and filter by player ID from the server
function fetchMatchHistory() {
    fetch(`/api/data?range=Match%20History!A2:M`) // Use server endpoint for fetching match history
        .then(response => response.json())
        .then(data => {
            if (data.values) {
                // Filter matches where the player ID matches either Player 1 ID or Player 2 ID in the match history
                matchHistoryData = data.values.filter(row => row[1] === playerID || row[4] === playerID); // Filter by Player 1 ID or Player 2 ID

                // Reverse the order to show newest to oldest
                matchHistoryData.reverse();

                // Display all matches initially
                displayMatches(matchHistoryData);

                // Draw performance graph
                drawPerformanceChart(matchHistoryData.reverse());
            } else {
                console.error("No data found for match history."); // Error: No data fetched
            }
        })
        .catch(error => console.error('Error fetching match history:', error));
}

function drawPerformanceChart(matches) {
    const ctx = document.getElementById('performance-chart').getContext('2d');
    const labels = matches.map((match, index) => `Match ${index + 1}`);
    const playerEloChanges = matches.map(match => {
        if (match[1] === playerID) { // Check by player ID
            return parseInt(match[6], 10); // Player 1 Elo Change
        } else {
            return parseInt(match[9], 10); // Player 2 Elo Change
        }
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${playerName}'s ELO Changes Over Time`,
                data: playerEloChanges,
                borderColor: '#f39c12',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Function to get the appropriate image based on the tournament name
function getTournamentImage(tournamentName) {
    if (!tournamentName) return '../Images/default-tournament.png';
    switch (tournamentName.toLowerCase()) {
        case 'tns':
            return '../Images/TNS.png';
        default:
            return '../Images/default-tournament.png';
    }
}

// Event listener for opponent search input
const opponentSearchInput = document.getElementById('opponent-search');
opponentSearchInput.addEventListener('input', () => {
    const searchQuery = opponentSearchInput.value.toLowerCase();
    filterMatchHistory(searchQuery);
});

function filterMatchHistory(searchQuery) {
    // Filter matches by opponent name or ID
    const filteredMatches = matchHistoryData.filter(match => {
        const isPlayer1 = match[1] === playerID;
        const opponentID = isPlayer1 ? match[4] : match[1]; // Use opponent's ID
        const opponentName = isPlayer1 ? match[3] : match[0]; // Use opponent's name
        
        // Check if the opponent's ID or name includes the search query
        return opponentID.toLowerCase().includes(searchQuery) || opponentName.toLowerCase().includes(searchQuery);
    });

    // Update match history with filtered matches
    displayMatches(filteredMatches);
}


function displayMatches(matches) {
    // Clear current displayed matches
    matchHistoryContainer.innerHTML = '';

    // Reset totals for accurate recalculation
    totalWins = 0;
    totalLosses = 0;

    matches.forEach(match => {
        const isPlayer1 = match[1] === playerID;
        const opponentName = isPlayer1 ? match[3] : match[0];
        const playerScore = isPlayer1 ? match[2] : match[5];
        const opponentScore = isPlayer1 ? match[5] : match[2];
        const opponentElo = isPlayer1 ? match[7] : match[6];
        const result = playerScore > opponentScore ? 'Win' : 'Loss';
        result === 'Win' ? totalWins++ : totalLosses++;

        const tournamentName = match[10] || 'Unknown';
        const tournamentLink = match[11] || '#';
        const playerEloChange = isPlayer1 ? match[8] : match[9];
        const reportDate = match[12] || 'Unknown Date';

        const tournamentImage = getTournamentImage(tournamentName);

        const matchElement = document.createElement('div');
        matchElement.classList.add('match-history-item');
        matchElement.classList.add(result.toLowerCase());

        matchElement.innerHTML = `
            <div class="match-details">
                <div class="match-info">
                    <h4><a href="player_details.html?player=${encodeURIComponent(opponentName)}">${opponentName}</a> <span>(ELO: ${opponentElo})</span></h4>
                    <p class="match-score">${playerScore} - ${opponentScore}</p>
                    <p class="match-date">Date: ${reportDate}</p>
                </div>
                <div class="match-elo-change ${result.toLowerCase()}">
                    ${playerEloChange > 0 ? '+' : ''}${playerEloChange}
                    <span class="triangle">${result === 'Win' ? '&#9650;' : '&#9660;'}</span>
                </div>
                <div class="tournament-info">
                    <a href="${tournamentLink}" target="_blank">
                        <img src="${tournamentImage}" alt="${tournamentName}" title="${tournamentName}">
                    </a>
                </div>
            </div>
        `;
        matchHistoryContainer.appendChild(matchElement);
    });

    // Recalculate and update win rate and stats after filtering
    const totalMatches = totalWins + totalLosses;
    const winRate = totalMatches ? ((totalWins / totalMatches) * 100).toFixed(2) : 0;
    totalWinsElement.textContent = totalWins;
    totalLossesElement.textContent = totalLosses;
    winRateElement.textContent = `${winRate}%`;
}
