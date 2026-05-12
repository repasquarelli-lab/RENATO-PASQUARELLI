const https = require('https');

https.get('https://html.duckduckgo.com/html/?q=pars+distribuidora+logo+svg', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log(data.match(/<img[^>]+src="([^">]+)"/gi) || []));
});
