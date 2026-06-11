const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Just return instructions - no Puppeteer
app.post('/api/tiktok', async (req, res) => {
    res.json({
        success: true,
        instructions: "Go to developers.tiktok.com → My Apps → Create App → Copy Client ID and Client Secret",
        manual: true
    });
});

app.post('/api/google', async (req, res) => {
    res.json({
        success: true,
        instructions: "Go to console.cloud.google.com → Credentials → Create API Key → Create OAuth Client ID",
        manual: true
    });
});

app.post('/api/meta', async (req, res) => {
    res.json({
        success: true,
        instructions: "Go to developers.facebook.com → My Apps → Create App → Settings → Basic → Copy App ID and Secret",
        manual: true
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
