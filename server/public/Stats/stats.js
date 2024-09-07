// stats.js

const sheetId = '18FhsiUln4p90my0G1JX4NdwWvlqzKrTE-_Mqxc44COk'; // Use the correct Sheet ID
const apiKey = 'AIzaSyBZMGrx13oqpIoGQdALhdvVlFnGFkW31Do'; // Your API key
const range = 'Player Details!A2:H'; // Range to fetch player details
let characterData = {}; // Object to hold character counts

document.addEventListener('DOMContentLoaded', async function () {
    await fetchCharacterData();
    createPieChart(characterData);
    displayCharacterList(characterData);
});

// Fetch character data from Google Sheets and filter top 32 players
async function fetchCharacterData() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`);
        const data = await response.json();
        const rows = data.values;

        // Sort players by ELO (column index 2), and take only the top 32
        const top32Players = rows
            .map(row => ({
                name: row[0],          // Player's name
                elo: parseFloat(row[2]), // Player's ELO score
                character: row[7]       // Character name
            }))
            .sort((a, b) => b.elo - a.elo) // Sort by ELO in descending order
            .slice(0, 32); // Take the top 32 players

        // Count character occurrences among the top 32 players
        top32Players.forEach(player => {
            const character = player.character;
            if (characterData[character]) {
                characterData[character]++;
            } else {
                characterData[character] = 1;
            }
        });

        console.log('Character Data for Top 32:', characterData); // Log character counts
    } catch (error) {
        console.error('Error fetching character data:', error);
    }
}

// Create a pie chart using Chart.js
function createPieChart(data) {
    const ctx = document.getElementById('character-pie-chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: generateColorPalette(Object.keys(data).length)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Character Representation in Top 32'
                }
            }
        }
    });
}

// Display character representation as a numbered list
function displayCharacterList(data) {
    const characterList = document.getElementById('character-list');

    // Convert object entries to an array and sort by count in descending order
    const sortedEntries = Object.entries(data).sort(([, countA], [, countB]) => countB - countA);

    // Clear existing list items
    characterList.innerHTML = '';

    // Create list items from sorted entries
    sortedEntries.forEach(([character, count]) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${character}: ${count}`;
        characterList.appendChild(listItem);
    });
}


// Generate a color palette for the pie chart
function generateColorPalette(numColors) {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        colors.push(`hsl(${(i * 360) / numColors}, 70%, 60%)`); // Generates a range of colors
    }
    return colors;
}
