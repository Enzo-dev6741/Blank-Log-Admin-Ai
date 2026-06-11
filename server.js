const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// TikTok Extraction
app.post('/api/tiktok', async (req, res) => {
    const { email, password } = req.body;
    let browser;
    
    try {
        console.log('Starting TikTok extraction...');
        
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Go to TikTok developer
        await page.goto('https://developers.tiktok.com/apps');
        await page.waitForTimeout(2000);
        
        // Click login
        const loginBtn = await page.$('a[href*="login"]');
        if (loginBtn) await loginBtn.click();
        await page.waitForTimeout(2000);
        
        // Enter credentials
        await page.type('input[name="email"], input[type="email"]', email);
        await page.type('input[name="password"], input[type="password"]', password);
        
        const submit = await page.$('button[type="submit"]');
        if (submit) await submit.click();
        
        await page.waitForTimeout(5000);
        
        // Get app list or create new
        const appsLink = await page.$('a[href*="apps"]');
        if (appsLink) await appsLink.click();
        await page.waitForTimeout(2000);
        
        // Try to get existing client ID
        let clientId = 'MANUAL_REQUIRED';
        let clientSecret = 'MANUAL_REQUIRED';
        
        try {
            const clientIdElem = await page.$('[data-e2e="client-id"], .client-id');
            if (clientIdElem) clientId = await clientIdElem.evaluate(el => el.textContent);
        } catch(e) {}
        
        await browser.close();
        
        res.json({
            success: true,
            clientId: clientId,
            clientSecret: clientSecret,
            message: 'Check developer.tiktok.com manually for keys if not shown'
        });
        
    } catch (error) {
        if (browser) await browser.close();
        res.json({ success: false, error: error.message });
    }
});

// Google Extraction
app.post('/api/google', async (req, res) => {
    const { email, password } = req.body;
    let browser;
    
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto('https://console.cloud.google.com/apis/credentials');
        await page.waitForTimeout(3000);
        
        // Google login
        const emailInput = await page.$('input[type="email"]');
        if (emailInput) {
            await page.type('input[type="email"]', email);
            await page.click('#identifierNext');
            await page.waitForTimeout(2000);
        }
        
        const passwordInput = await page.$('input[type="password"]');
        if (passwordInput) {
            await page.type('input[type="password"]', password);
            await page.click('#passwordNext');
            await page.waitForTimeout(5000);
        }
        
        await browser.close();
        
        res.json({
            success: true,
            message: 'Google login completed. Check console.cloud.google.com for keys.'
        });
        
    } catch (error) {
        if (browser) await browser.close();
        res.json({ success: false, error: error.message });
    }
});

// Meta Extraction
app.post('/api/meta', async (req, res) => {
    const { email, password } = req.body;
    let browser;
    
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto('https://developers.facebook.com/apps');
        await page.waitForTimeout(3000);
        
        await browser.close();
        
        res.json({
            success: true,
            message: 'Meta portal opened. Check developers.facebook.com for keys.'
        });
        
    } catch (error) {
        if (browser) await browser.close();
        res.json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
