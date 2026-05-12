fetch('https://www.pars.com.br/wp-content/themes/pars/assets/images/logo.svg').then(res => res.text()).then(console.log).catch(console.error);
fetch('https://www.pars.com.br/wp-content/themes/pars/assets/images/logo-pars.svg').then(res => res.text()).then(console.log).catch(console.error);
fetch('https://www.pars.com.br/wp-content/uploads/2023/10/logo-pars.svg').then(res => res.text()).then(console.log).catch(console.error);
fetch('https://www.pars.com.br/').then(res => res.text()).then(html => {
  const match = html.match(/<img[^>]+src="([^">]+logo[^">]+)"/i);
  if (match) console.log("Found logo URL:", match[1]);
});
