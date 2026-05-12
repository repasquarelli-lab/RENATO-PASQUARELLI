import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://api.duckduckgo.com/?q=pars+distribuidora+logo&format=json', { waitUntil: 'networkidle2' });
    const content = await page.content();
    fs.writeFileSync('ddg_api.json', await page.evaluate(() => document.body.innerText));
    await browser.close();
})();
