// Particles.js Configuration
particlesJS('particles-js', {
    "particles": {
        "number": {
            "value": 80,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#ffffff"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            }
        },
        "opacity": {
            "value": 0.5,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 5,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 6,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "repulse"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
});

const sheetId = '18FhsiUln4p90my0G1JX4NdwWvlqzKrTE-_Mqxc44COk';
const apiKey = 'AIzaSyBZMGrx13oqpIoGQdALhdvVlFnGFkW31Do';
const range = 'Player Details!A2:H';
const matchHistoryRange = 'Match History!A2:J';
let matchHistoryData = [];

document.addEventListener('DOMContentLoaded', async function () {
    await fetchMatchHistory(); // Ensure match history is loaded first
    fetchPlayerData();
});

async function fetchPlayerData() {
    try {
        const response = await fetch('/api/data?range=Player%20Details!A2:H'); // Fetch from server endpoint
        const data = await response.json();
        const rows = data.values;

        console.log('Fetched rows from server:', rows); // Log the entire fetched data

        const players = rows.map((row) => {
            console.log('Processing row:', row); // Log each row to check structure
            return {
                name: row[0], // Player's name
                elo: parseFloat(row[2]).toFixed(1), // Player's Elo
                totalWins: parseInt(row[3], 10), // Player's total wins
                totalLosses: parseInt(row[4], 10), // Player's total losses
                character: row[7], // Character name
                twitch: row[6], // Twitch link
                twitter: row[7] // Twitter link
            };
        });

        console.log('Parsed player data:', players); // Log the parsed player data

        // Sort players by ELO in descending order
        players.sort((a, b) => b.elo - a.elo);

        // Assign ranks based on sorted ELO
        players.forEach((player, index) => {
            player.rank = index + 1;
        });

        // Render the top 8 players
        renderTopPlayers(players.slice(0, 8));
        renderLeaderboard(players.slice(8, 32)); // Ranks 9-25
    } catch (error) {
        console.error('Error fetching player data:', error);
    }
}


async function fetchMatchHistory() {
    try {
        const response = await fetch('/api/data?range=Match%20History!A2:J'); // Fetch from server endpoint
        const data = await response.json();
        matchHistoryData = data.values || [];
    } catch (error) {
        console.error('Error fetching match history:', error);
    }
}


function calculateWinLossRecord(playerName) {
    let wins = 0;
    let losses = 0;

    matchHistoryData.forEach(match => {
        const [player1, player1Score, player2, player2Score] = match;

        if (player1 === playerName || player2 === playerName) {
            const playerIsPlayer1 = player1 === playerName;
            const playerWon = playerIsPlayer1 ? parseInt(player1Score) > parseInt(player2Score) : parseInt(player2Score) > parseInt(player1Score);

            if (playerWon) {
                wins++;
            } else {
                losses++;
            }
        }
    });

    const winLossPercentage = calculateWinLossPercentage(wins, losses);
    return { wins, losses, winLossPercentage };
}

function calculateWinLossPercentage(wins, losses) {
    const totalGames = wins + losses;
    return totalGames === 0 ? '0%' : `${((wins / totalGames) * 100).toFixed(2)}%`;
}

function getTopDefeatedPlayers(playerName) {
    const defeatedPlayers = [];

    matchHistoryData.forEach(match => {
        const [player1, player1Score, player2, player2Score, player1Elo, player2Elo] = match;
        if (player1 === playerName && parseInt(player1Score) > parseInt(player2Score)) {
            defeatedPlayers.push({ name: player2, elo: parseFloat(player2Elo) });
        } else if (player2 === playerName && parseInt(player2Score) > parseInt(player1Score)) {
            defeatedPlayers.push({ name: player1, elo: parseFloat(player1Elo) });
        }
    });

    // Sort by ELO and return the top 3 defeated players
    defeatedPlayers.sort((a, b) => b.elo - a.elo);
    return defeatedPlayers.slice(0, 3);
}

function renderTopPlayers(players) {
    const containers = [
        'first-place-container',
        'second-player',
        'third-player',
        'fourth-player',
        'fifth-player',
        'sixth-player',
        'seventh-player',
        'eighth-player'
    ];

    players.forEach((player, index) => {
        const container = document.getElementById(containers[index]);
        const imagePath = `./Images/${player.character}.png`;

        // Log the path to ensure it's correct
        console.log(`Setting background image for ${player.name} with path: ${imagePath}`);

        // Apply the character image based on rank
        container.style.backgroundImage = `url('${imagePath}')`;

        container.innerHTML = `
            <h1>#${player.rank} ${player.name}</h1>
            <h2>ELO: ${player.elo}</h2>
            <div class="socials">
                <a href="${player.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>
                <a href="${player.twitch}" target="_blank"><i class="fab fa-twitch"></i></a>
            </div>
            <div class="player-overlay"></div>
        `;

        // Add event listener for overlay toggle
        container.addEventListener('click', () => toggleOverlay(container, player.name));
    });
}

function renderLeaderboard(players) {
    const container = document.getElementById('leaderboard-container');
    container.innerHTML = ''; // Clear container before rendering

    players.forEach((player) => {
        const { wins, losses, winLossPercentage } = calculateWinLossRecord(player.name);

        const playerDiv = document.createElement('div');
        playerDiv.classList.add('leaderboard-player');
        playerDiv.style.backgroundImage = `url('./Images/${player.character}.png')`;
        playerDiv.style.backgroundSize = '40%';
        playerDiv.style.backgroundPosition = '100% 20%';
        playerDiv.style.backgroundRepeat = 'no-repeat';
        playerDiv.style.opacity = '0.7';

        playerDiv.innerHTML = `
            <div class="player-rank">${player.rank}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-elo">${player.elo}</div>
            <div class="player-winrate">
                <div class="win-rate-bar smaller">
                    <div class="fill-bar" style="width: ${winLossPercentage};"></div>
                </div>
                <div class="winrate-percentage">${winLossPercentage}</div>
            </div>
            <div class="socials">
                <a href="${player.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>
                <a href="${player.twitch}" target="_blank"><i class="fab fa-twitch"></i></a>
            </div>
        `;
        container.appendChild(playerDiv);
    });

    observeElements();
}

function toggleOverlay(playerDiv, playerName) {
    const overlay = playerDiv.querySelector('.player-overlay');
    if (overlay.classList.contains('visible')) {
        overlay.classList.remove('visible');
        overlay.innerHTML = '';
    } else {
        const { wins, losses, winLossPercentage } = calculateWinLossRecord(playerName);
        const topDefeatedPlayers = getTopDefeatedPlayers(playerName);

        overlay.innerHTML = `
            <div class="overlay-content">
                <p>Win Rate: ${winLossPercentage}</p>
                <div class="win-rate-bar">
                    <div class="fill-bar" style="width: ${winLossPercentage};"></div>
                </div>
                <p>Wins: ${wins} | Losses: ${losses}</p>
                <p><strong>Top 3 ELO Defeated:</strong></p>
                <ul>
                    ${topDefeatedPlayers.map(player => `<li>${player.name} (ELO: ${player.elo})</li>`).join('')}
                </ul>
            </div>
        `;
        overlay.classList.add('visible');
    }
}

function observeElements() {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else {
                entry.target.classList.remove('in-view');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.leaderboard-player').forEach(playerDiv => {
        observer.observe(playerDiv);
    });
}
