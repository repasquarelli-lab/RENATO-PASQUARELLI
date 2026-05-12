const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'pars.com.br',
  port: 443,
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('pars_home.html', data);
    console.log('Saved pars_home.html');
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
