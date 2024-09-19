const sheetId = '18FhsiUln4p90my0G1JX4NdwWvlqzKrTE-_Mqxc44COk'; // Your Google Sheet ID
const apiKey = 'AIzaSyBZMGrx13oqpIoGQdALhdvVlFnGFkW31Do'; // Your API Key
const playerDetailsRange = 'Player Details!A2:H'; // Range to fetch player details
const matchHistoryRange = 'Match History!A2:M'; // Range to fetch match history
const icarusEloRange = 'Player Details!E2:E'; // Range to fetch Icarus Elo values from column E

let characterData = {}; // Object to hold character counts
let eloData = []; // Array to hold ELO data
let averageEloData = []; // Array to track average ELO over matches
let icarusEloData = []; // Array to hold Icarus Elo values

document.addEventListener('DOMContentLoaded', async function () {
    await fetchCharacterData();
    await fetchEloAndWinLossData();
    await fetchIcarusEloData();
    createPieChart(characterData);
    createAverageEloLineChart(averageEloData);
    createIcarusEloDistributionChart(icarusEloData);
    displayCharacterList(characterData);
});

// Fetch character data from Google Sheets and filter top 32 players
async function fetchCharacterData() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${playerDetailsRange}?key=${apiKey}`);
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

// Fetch ELO and win/loss data from Google Sheets
async function fetchEloAndWinLossData() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${matchHistoryRange}?key=${apiKey}`);
        const data = await response.json();
        const rows = data.values;

        // Arrays to store cumulative ELOs for both players
        let cumulativeEloSum = 0;
        let totalMatches = 0;

        rows.forEach((row) => {
            const player1EloBefore = parseInt(row[6], 10); // Player 1 ELO before the match
            const player2EloBefore = parseInt(row[7], 10); // Player 2 ELO before the match

            // Update the cumulative sum of ELOs and total match count
            cumulativeEloSum += player1EloBefore + player2EloBefore;
            totalMatches += 2; // Both players count

            // Calculate the average ELO up to this point
            const averageElo = cumulativeEloSum / totalMatches;
            averageEloData.push(averageElo);
        });

        console.log('Average ELO Data:', averageEloData);
    } catch (error) {
        console.error('Error fetching ELO and win/loss data:', error);
    }
}

// Fetch Icarus Elo data from Google Sheets (column E)
async function fetchIcarusEloData() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${playerDetailsRange}?key=${apiKey}`);
        const data = await response.json();
        const rows = data.values;

        // Extract Icarus Elo values from column 4 (index 4 in zero-based index system)
        icarusEloData = rows.map(row => parseInt(row[4], 10)).filter(value => !isNaN(value));

        console.log('Icarus Elo Data:', icarusEloData); // Log Icarus Elo data
    } catch (error) {
        console.error('Error fetching Icarus Elo data:', error);
    }
}

// Create a pie chart for character representation
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
                    display: true,
                    position: 'right',
                    labels: {
                        boxWidth: 10, // Smaller boxes in the legend
                        font: {
                            size: 12 // Smaller font size for legend items
                        },
                        color: '#ffffff', // Makes legend text white
                        padding: 10 // Space between legend items
                    }
                },
                title: {
                    display: true,
                    text: 'Character Representation in Top 32',
                    color: '#ffffff', // Makes title text white
                    font: {
                        size: 16 // Adjust title size
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10
                }
            }
        }
    });
}


// Create a line chart for average ELO over time
function createAverageEloLineChart(data) {
    const ctx = document.getElementById('average-elo-line-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: data.length }, (_, i) => `Match ${i + 1}`),
            datasets: [{
                label: 'Average ELO Over Time',
                data: data,
                borderColor: '#f39c12',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Match Index',
                        color: '#ffffff'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Average ELO',
                        color: '#ffffff'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#ffffff' // Makes legend text white
                    }
                },
                title: {
                    display: true,
                    text: 'Average ELO Over Time',
                    color: '#ffffff'
                }
            }
        }
    });
}

// Create a bar chart to display the distribution of Icarus Elo values
function createIcarusEloDistributionChart(data) {
    // Define bins for the histogram (e.g., ranges of Icarus Elo values)
    const bins = [800, 850, 900, 950, 1000, 1050, 1100, 1150];
    const counts = new Array(bins.length).fill(0); // Array to count occurrences in each bin

    // Count occurrences in each bin
    data.forEach(value => {
        for (let i = 0; i < bins.length; i++) {
            if (value <= bins[i]) {
                counts[i]++;
                break;
            }
        }
    });

    const ctx = document.getElementById('icarus-elo-distribution-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.map((bin, index) => `${index === 0 ? 800 : bins[index - 1] + 1} - ${bin}`),
            datasets: [{
                label: 'Icarus Elo Distribution',
                data: counts,
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Icarus Elo Range',
                        color: '#ffffff'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Players',
                        color: '#ffffff'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Distribution of Icarus Elo',
                    color: '#ffffff'
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
