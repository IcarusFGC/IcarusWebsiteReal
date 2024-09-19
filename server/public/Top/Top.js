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

// Fetching data securely without exposing API keys
const range = 'Player Details!A2:H';
let matchHistoryData = [];

document.addEventListener('DOMContentLoaded', async function () {
    await fetchMatchHistory(); // Ensure match history is loaded first
    fetchPlayerData();
});

// Search function to handle search action and redirect to the search results page
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

async function fetchPlayerData() {
    try {
        // Fetch player data securely from the server endpoint
        const response = await fetch('/api/data?range=Player%20Details!A2:H'); // Fetch from server endpoint
        const data = await response.json();
        const rows = data.values || [];

        console.log('Fetched rows from server:', rows); // Log the entire fetched data

        const players = rows.map((row) => {
            console.log('Processing row:', row); // Log each row to check structure
            const totalWins = parseInt(row[5], 10); // Player's total wins
            const totalLosses = parseInt(row[6], 10); // Player's total losses
            const winLossPercentage = calculateWinLossPercentage(totalWins, totalLosses); // Calculated win-loss percentage

            return {
                name: row[0], // Player's name
                elo: parseFloat(row[2]).toFixed(1), // Player's Online Elo
                totalWins, // Player's total wins
                totalLosses, // Player's total losses
                winLossPercentage, // Calculated win-loss percentage
                character: row[7], // Character name
                twitch: row[8], // Twitch link
                twitter: row[9] // Twitter link
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

function calculateWinLossPercentage(totalWins, totalLosses) {
    const totalGames = totalWins + totalLosses;
    return totalGames === 0 ? '0%' : `${((totalWins / totalGames) * 100).toFixed(2)}%`;
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

        console.log(`Setting background image for ${player.name} with path: ${imagePath}`);

        // Store player data directly on the container element for easy access
        container.playerData = player;

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

        container.addEventListener('click', () => toggleOverlay(container));
    });
}

function renderLeaderboard(players) {
    const container = document.getElementById('leaderboard-container');
    container.innerHTML = ''; // Clear container before rendering

    players.forEach((player) => {
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('leaderboard-player');

        // Add a custom class based on the character's name for special styling
        const characterClass = `character-${player.character.toLowerCase().replace(/\s+/g, '-')}`;
        playerDiv.classList.add(characterClass);

        playerDiv.style.backgroundImage = `url('./Images/${player.character}.png')`;
        playerDiv.style.backgroundSize = '40%';
        playerDiv.style.backgroundPosition = '100% 20%'; // Default position
        playerDiv.style.backgroundRepeat = 'no-repeat';
        playerDiv.style.opacity = '0.7';

        // Store player data on the div for easy access
        playerDiv.playerData = player;

        playerDiv.innerHTML = `
            <div class="player-rank">${player.rank}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-elo">${player.elo}</div>
            <div class="player-winrate">
                <div class="win-rate-bar smaller">
                    <div class="fill-bar" style="width: ${player.winLossPercentage};"></div>
                </div>
                <div class="winrate-percentage">Win Rate: ${player.winLossPercentage}</div>
            </div>
            <div class="socials">
                <a href="${player.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>
                <a href="${player.twitch}" target="_blank"><i class="fab fa-twitch"></i></a>
            </div>
        `;

        adjustFontSize(playerDiv.querySelector('.player-name')); // Adjust font size based on content length
        playerDiv.addEventListener('click', () => toggleOverlay(playerDiv));
        container.appendChild(playerDiv);
    });

    observeElements();
}

// Function to adjust the font size if the text is too long
function adjustFontSize(element) {
    let fontSize = 1.2; // Start with a base font size
    while (element.scrollWidth > element.clientWidth && fontSize > 0.8) {
        fontSize -= 0.1;
        element.style.fontSize = `${fontSize}rem`;
    }
}


function toggleOverlay(playerDiv) {
    const overlay = playerDiv.querySelector('.player-overlay');
    const player = playerDiv.playerData; // Access player data from the div

    if (!player) {
        console.error('Player data not found for:', playerDiv);
        return;
    }

    if (overlay.classList.contains('visible')) {
        overlay.classList.remove('visible');
        overlay.innerHTML = '';
    } else {
        const { totalWins, totalLosses, winLossPercentage } = player;

        overlay.innerHTML = `
            <div class="overlay-content">
                <p>Win Rate: ${winLossPercentage}</p>
                <div class="win-rate-bar">
                    <div class="fill-bar" style="width: ${winLossPercentage};"></div>
                </div>
                <p>Wins: ${totalWins} | Losses: ${totalLosses}</p>
                
                <ul>
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
