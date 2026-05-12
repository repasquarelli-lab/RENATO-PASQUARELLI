const https = require('https');
const fs = require('fs');

https.get('https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/pars.png', (res) => { // Let's guess where it might be, or maybe just look for a public svg
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('pars.png', data);
  });
});
