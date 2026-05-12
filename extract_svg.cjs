const fs = require('fs');

const html = fs.readFileSync('pars_home.html', 'utf8');
const svgs = html.match(/<svg[\s\S]*?<\/svg>/gi) || [];
console.log(`Found ${svgs.length} SVGs`);
svgs.forEach((svg, i) => {
    fs.writeFileSync(`svg_${i}.svg`, svg);
});
