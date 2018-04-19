const puppeteer = require('puppeteer');
var fs = require('fs');
var dir = '../vp_screenshots/';

const viewports = [1280, 768, 375];
const pages = require('../pages.json');
let scrapestatus = 0;

if ( !fs.existsSync(dir) ){
    fs.mkdirSync(dir);
}

let screenscrape = function(i) {
    console.log(" -- screenscrape is running on:", pages[i].title);

    let imageName = pages[i].title.replace(/ /g, "-").replace(/'/g, "").toLowerCase();

    puppeteer.launch().then(async browser => {
        const promises= [];
        
        viewports.forEach(vp => {
            promises.push(browser.newPage().then(async page => {
                await page.goto(pages[i].url, { timeout: 0 });
                await page.setViewport({width: vp, height: 1});
                await page.screenshot({
                    path: dir + i + '-' + vp + 'px-' + imageName + '.png',
                    fullPage: true
                });
                await page.close();
            }));
        });

        scrapestatus += 1;

        await Promise.all(promises).then(function(){
            ( scrapestatus != pages.length ) ? screenscrape(scrapestatus) : console.log(' -- Screenscrape has finished!');            
        });

        browser.close();
    });
}

screenscrape(scrapestatus);