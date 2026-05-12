import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Set User Agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');
  
  await page.goto('https://pars.com.br/wp-content/themes/pars/assets/images/logo.svg', { waitUntil: 'networkidle2' });
  const content = await page.content();
  fs.writeFileSync('pars_logo_real.svg', content);
  console.log("Saved pars_logo_real.svg, length:", content.length);
  await browser.close();
})();
