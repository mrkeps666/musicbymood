const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

let tracks = [];
let currentIndex = 0;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { track: null, lyrics: null });
});

app.get('/search', async (req, res) => {
    const mood = req.query.mood;
    try {
        const response = await axios.get(`https://api.deezer.com/search?q=${mood}&limit=10`);
        tracks = response.data.data;
        currentIndex = 0;
        const track = tracks[currentIndex];
        const lyrics = await getLyrics(track.id);
        res.render('index', { track, lyrics });
    } catch (error) {
        res.status(500).send('Error fetching song');
    }
});

app.get('/next', async (req, res) => {
    if (tracks.length > 0) {
        currentIndex = (currentIndex + 1) % tracks.length;
        const track = tracks[currentIndex];
        const lyrics = await getLyrics(track.id);
        res.render('index', { track, lyrics });
    } else {
        res.redirect('/');
    }
});

app.get('/previous', async (req, res) => {
    if (tracks.length > 0) {
        currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
        const track = tracks[currentIndex];
        const lyrics = await getLyrics(track.id);
        res.render('index', { track, lyrics });
    } else {
        res.redirect('/');
    }
});

async function getLyrics(trackId) {
    try {
        const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
        return response.data.lyrics;
    } catch (error) {
        return 'Lyrics not available';
    }
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
