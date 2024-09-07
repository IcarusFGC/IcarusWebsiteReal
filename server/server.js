import 'dotenv/config'; // Load environment variables from .env
import express from 'express'; // Import Express
import fetch from 'node-fetch'; // Import node-fetch to fetch data

const app = express(); // Create an instance of Express
const port = process.env.PORT || 3000; // Use the port from .env or default to 3000

// Middleware to serve static files from the 'public' directory
app.use(express.static('public'));

// Serve the main home.html file as the root route
app.get('/', (req, res) => {
    res.sendFile('home.html', { root: './public' }); // Serve home.html from the 'public' directory
});

// Endpoint to fetch data from Google Sheets
app.get('/api/data', async (req, res) => {
    try {
        const sheetId = process.env.SHEET_ID;
        const apiKey = process.env.GOOGLE_API_KEY;
        const range = req.query.range || 'Player Details!A2:G'; // Default range if not specified
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

        console.log(`Fetching data from URL: ${url}`); // Debugging: Log the fetch URL

        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text(); // Get detailed error message from response
            console.error(`Error fetching data: ${response.statusText} - ${errorText}`);
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error); // Log detailed error message
        res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 status code
    }
});

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`); // Log the server URL
});
