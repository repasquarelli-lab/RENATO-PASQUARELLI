const fs = require('fs');

const html = fs.readFileSync('cache.html', 'utf8');

// Find all svgs
const svgs = html.match(/<svg[\s\S]*?<\/svg>/gi) || [];
console.log(`Found ${svgs.length} SVGs`);
svgs.forEach((svg, i) => {
    fs.writeFileSync(`svg_cache_${i}.svg`, svg);
});

// find all images with logo
const imgs = html.match(/<img[^>]*logo[^>]*>/gi);
console.log("Images:");
console.log(imgs);
