fetch('https://api.brandfetch.io/v2/brands/pars.com.br')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
