import puppeteer from 'puppeteer';
import fs from 'fs';

// simple script to get the logo SVG
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://pars.com.br/', { waitUntil: 'networkidle2' });
    const svgs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.includes('logo'));
    });
    console.log("IMGS:", svgs);
    const inlinesvgs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('svg')).map(svg => svg.outerHTML);
    });
    fs.writeFileSync('svgs.json', JSON.stringify(inlinesvgs));
    await browser.close();
})();
