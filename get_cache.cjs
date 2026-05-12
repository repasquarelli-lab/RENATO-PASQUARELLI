const https = require('https');
const fs = require('fs');

https.get('https://webcache.googleusercontent.com/search?q=cache:pars.com.br', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    fs.writeFileSync('cache.html', data);
    console.log('Saved cache.html. size: ', data.length);
  });
});
