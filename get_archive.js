import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://web.archive.org/web/20230601000000/https://pars.com.br/', { waitUntil: 'networkidle2' });
    const content = await page.content();
    fs.writeFileSync('archive.html', content);
    
    // Evaluate inside page to find svg
    const svgs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('svg')).map(svg => svg.outerHTML).filter(s => s.length > 500);
    });
    fs.writeFileSync('archive_svgs.json', JSON.stringify(svgs));
    
    // Evaluate inside page to find img src containing logo
    const imgs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => img.src).filter(s => s.toLowerCase().includes('logo'));
    });
    fs.writeFileSync('archive_imgs.json', JSON.stringify(imgs));
    
    await browser.close();
})();
