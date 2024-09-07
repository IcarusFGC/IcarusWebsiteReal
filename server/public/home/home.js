// home.js

// Function to handle the search action and redirect to the search results page
function handleSearch(query) {
    if (query) {
        window.location.href = `./search_results/search_results.html?query=${encodeURIComponent(query)}`;
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

// Add event listener to the main search bar
document.getElementById('main-search').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const query = event.target.value.trim();
        handleSearch(query);
    }
});
