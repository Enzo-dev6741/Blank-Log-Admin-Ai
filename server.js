const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

let browser = null;
let page = null;

// TikTok Extraction
app.post('/api/extract/tiktok', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        console.log('Launching browser for TikTok...');
        browser = await puppeteer.launch({ 
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        
        console.log('Navigating to TikTok Developer...');
        await page.goto('https://developers.tiktok.com', { waitUntil: 'networkidle2' });
        
        await page.waitForTimeout(2000);
        
        // Click login button
        const loginBtn = await page.$('a[href*="login"]');
        if (loginBtn) await loginBtn.click();
        
        await page.waitForTimeout(2000);
        
        // Enter credentials
        await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
        await page.type('input[type="email"], input[name="email"]', email);
        await page.type('input[type="password"], input[name="password"]', password);
        
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) await submitBtn.click();
        
        await page.waitForTimeout(5000);
        
        // Navigate to My Apps
        const myAppsLink = await page.$('a[href*="apps"]');
        if (myAppsLink) await myAppsLink.click();
        
        await page.waitForTimeout(3000);
        
        // Try to extract keys
        let clientId = 'NOT_FOUND';
        let clientSecret = 'NOT_FOUND';
        
        try {
            clientId = await page.$eval('[data-e2e="client-id"], .client-id', el => el.textContent);
        } catch(e) {}
        
        try {
            clientSecret = await page.$eval('[data-e2e="client-secret"], .client-secret', el => el.textContent);
        } catch(e) {}
        
        await browser.close();
        
        res.json({ 
            success: true, 
            clientId: clientId,
            clientSecret: clientSecret,
            message: 'Extraction complete. If keys show NOT_FOUND, please extract manually.'
        });
        
    } catch (error) {
        console.error('TikTok error:', error);
        if (browser) await browser.close();
        res.json({ success: false, error: error.message });
    }
});

// Google Cloud Extraction
app.post('/api/extract/google', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        console.log('Launching browser for Google...');
        browser = await puppeteer.launch({ 
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        
        await page.goto('https://console.cloud.google.com/apis/credentials', { waitUntil: 'networkidle2' });
        
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
        
        await page.waitForTimeout(3000);
        
        // Try to get existing API key
        let apiKey = 'NOT_FOUND';
        let clientId = 'NOT_FOUND';
        let clientSecret = 'NOT_FOUND';
        
        try {
            const apiKeyElement = await page.$('.api-key-value, code');
            if (apiKeyElement) apiKey = await apiKeyElement.textContent;
        } catch(e) {}
        
        await browser.close();
        
        res.json({ 
            success: true, 
            apiKey: apiKey,
            clientId: clientId,
            clientSecret: clientSecret,
            message: 'Google Cloud extraction complete. You may need to create keys manually in the console.'
        });
        
    } catch (error) {
        console.error('Google error:', error);
        if (browser) await browser.close();
        res.json({ success: false, error: error.message });
    }
});

// Meta/Instagram Extraction
app.post('/api/extract/meta', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        console.log('Launching browser for Meta...');
        browser = await puppeteer.launch({ 
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        
        await page.goto('https://developers.facebook.com', { waitUntil: 'networkidle2' });
        
        await page.waitForTimeout(2000);
        
        // Click My Apps
        const myAppsLink = await page.$('a[href*="apps"]');
        if (myAppsLink) await myAppsLink.click();
        
        await page.waitForTimeout(3000);
        
        let appId = 'NOT_FOUND';
        let appSecret = 'NOT_FOUND';
        
        try {
            appId = await page.$eval('[data-testid="app-id"], .app-id', el => el.textContent);
        } catch(e) {}
        
        try {
            appSecret = await page.$eval('[data-testid="app-secret"], .app-secret', el => el.textContent);
        } catch(e) {}
        
        await browser.close();
        
        res.json({ 
            success: true, 
            appId: appId,
            appSecret: appSecret,
            message: 'Meta extraction complete. If keys show NOT_FOUND, please extract manually.'
        });
        
    } catch (error) {
        console.error('Meta error:', error);
        if (browser) await browser.close();
        res.json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n✅ Blank Log™ Admin AI running at: http://localhost:${PORT}`);
    console.log('\n📋 Instructions:');
    console.log('1. Open your browser to http://localhost:3000');
    console.log('2. Click each platform button');
    console.log('3. Enter your email and password when prompted');
    console.log('4. Copy the extracted keys and send them to your developer\n');
});
