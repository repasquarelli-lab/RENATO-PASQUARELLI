"use strict";
const https = require("https");
const fs = require("fs");

const req = https.get("https://pars.com.br", (res) => {
    let raw = "";
    res.on("data", c => raw += c);
    res.on("end", () => {
        let matches = raw.match(/<img[^>]+src="([^"]*logo[^"]*)"/gi);
        console.log("Found:", matches);
        
        let svgs = raw.match(/<svg[^>]*>[\s\S]*?<\/svg>/gi);
        if (svgs) {
           fs.writeFileSync("found_svgs.json", JSON.stringify(svgs));
        }
    });
});
req.on('error', e => console.error(e));
