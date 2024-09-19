const sheetId = '18FhsiUln4p90my0G1JX4NdwWvlqzKrTE-_Mqxc44COk'; // Your Google Sheet ID
const apiKey = 'AIzaSyBZMGrx13oqpIoGQdALhdvVlFnGFkW31Do'; // Your API Key
const playerDetailsRange = 'Player Details!A2:H'; // Range to fetch player details

document.getElementById('elo-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Retrieve names from textarea and split by lines
    const playerNames = document.getElementById('player-names').value.split('\n').map(name => name.trim()).filter(name => name);
    
    // Fetch player details from Google Sheets
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${playerDetailsRange}?key=${apiKey}`);
    const data = await response.json();
    const rows = data.values;

    // Create a map of player ELOs
    const playerEloMap = {};
    rows.forEach(row => {
        const name = row[0];
        const elo = parseInt(row[4], 10); // Assuming Icarus ELO is in column E (index 4)
        if (!isNaN(elo)) {
            playerEloMap[name] = elo;
        }
    });

    // Filter and sort players by ELO
    const sortedPlayers = playerNames
        .map(name => ({ name, elo: playerEloMap[name] || 0 }))
        .sort((a, b) => b.elo - a.elo);

    // Display sorted players
    const sortedPlayersList = document.getElementById('sorted-players');
    sortedPlayersList.innerHTML = '';
    sortedPlayers.forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${player.name}</span> <span>ELO: ${player.elo}</span>`;
        sortedPlayersList.appendChild(li);
    });
});
