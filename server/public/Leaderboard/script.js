// script.js

const leaderboardList = document.getElementById('leaderboard-list');
const searchInput = document.getElementById('search-input');
const eloToggle = document.getElementById('elo-toggle');

// Function to fetch data from the server
async function fetchData(range) {
    const url = `/api/data?range=${encodeURIComponent(range)}`; // Fetch data through server endpoint
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched Data:', data.values); // Debug: Log fetched data to console
        return data.values || [];
    } catch (error) {
        console.error('Error fetching data from server:', error); // Log detailed error message
        return [];
    }
}

// Function to render the leaderboard
async function renderLeaderboard(sortBy = 'Icarus Elo') {
    const players = await fetchData('Player Details!A2:G'); // Fetch data with range

    // Check if data is properly fetched
    if (!players || !Array.isArray(players) || players.length === 0) {
        console.error('No player data found or data format is incorrect.');
        return;
    }

    leaderboardList.innerHTML = ''; // Clear existing leaderboard

    // Map player data from fetched values and ensure parsing as numbers
    const playerData = players.map(player => ({
        name: player[0],
        onlineElo: parseInt(player[2], 10) || 0,
        offlineElo: parseInt(player[3], 10) || 0,
        icarusElo: parseInt(player[4], 10) || 0,
        wins: parseInt(player[5], 10) || 0,
        losses: parseInt(player[6], 10) || 0
    }));

    // Sort the player data based on the selected Elo type
    playerData.sort((a, b) => {
        if (sortBy === 'Online Elo') {
            return b.onlineElo - a.onlineElo;
        } else if (sortBy === 'Offline Elo') {
            return b.offlineElo - a.offlineElo;
        } else {
            return b.icarusElo - a.icarusElo;
        }
    });

    // Render the sorted leaderboard
    playerData.forEach((player, index) => {
        const tr = document.createElement('tr');

        const rankTd = document.createElement('td');
        rankTd.textContent = index + 1;

        const nameTd = document.createElement('td');
        const nameLink = document.createElement('a');
        nameLink.textContent = player.name;
        nameLink.href = `../player_details/player_details.html?player=${encodeURIComponent(player.name)}`;
        nameTd.appendChild(nameLink);

        const eloTd = document.createElement('td');
        eloTd.textContent = sortBy === 'Online Elo' ? player.onlineElo :
                            sortBy === 'Offline Elo' ? player.offlineElo :
                            player.icarusElo;

        const winsTd = document.createElement('td');
        winsTd.textContent = player.wins;

        const lossesTd = document.createElement('td');
        lossesTd.textContent = player.losses;

        tr.appendChild(rankTd);
        tr.appendChild(nameTd);
        tr.appendChild(eloTd);
        tr.appendChild(winsTd);
        tr.appendChild(lossesTd);

        // Apply glow effect to top 25 players
        if (index < 32) tr.classList.add('top-25-glow');

        leaderboardList.appendChild(tr);

        // Add break line after 25th player
        if (index === 31) {
            const breakLine = document.createElement('tr');
            const breakTd = document.createElement('td');
            breakTd.colSpan = 5; // Assuming there are 5 columns (Rank, Player, ELO, Wins, Losses)
            breakTd.innerHTML = '<div class="break-line">Icarus Index</div>';
            breakLine.appendChild(breakTd);
            leaderboardList.appendChild(breakLine);
        }
    });
}

// Event listener for changing the Elo type via the dropdown
eloToggle.addEventListener('change', (event) => {
    renderLeaderboard(event.target.value); // Render leaderboard based on selected Elo type
});

// Search functionality
searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase(); // Get search input
    const rows = leaderboardList.querySelectorAll('tr'); // Select all table rows
    rows.forEach(row => {
        const text = row.textContent.toLowerCase(); // Get text of each row
        if (text.includes(filter)) {
            row.style.display = ''; // Show row if text matches
        } else {
            row.style.display = 'none'; // Hide row if text doesn't match
        }
    });
});

// Initial rendering of the leaderboard sorted by Icarus Elo
renderLeaderboard();
