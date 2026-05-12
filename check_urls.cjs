const https = require('https');

const urls = [
  'https://pars.com.br/wp-content/themes/pars/assets/images/logo.svg',
  'https://pars.com.br/wp-content/uploads/logo.svg',
  'https://pars.com.br/wp-content/uploads/2023/10/logo-pars.svg'
];

urls.forEach(url => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => console.log(url, res.statusCode, data.slice(0, 100)));
  }).on('error', console.error);
});
