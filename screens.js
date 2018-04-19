const puppeteer = require('puppeteer');
var fs = require('fs');
const sizeOf = require('image-size');
const path = require('path');
const Canvas = require('canvas');
const pages = require('./pages.json');

const vpdir = './vpscreens/';
const pgdir = './pgscreens/';
const viewports = [375, 768, 1280];
let scrapestatus = 0;

if ( !fs.existsSync(vpdir) ){
    fs.mkdirSync(vpdir);
}

if ( !fs.existsSync(pgdir) ){
    fs.mkdirSync(pgdir);
}

let screenscrape = function(i) {
    console.log(" -- screenscrape is running on:", pages[i].title);

    let imageName = pages[i].title.replace(/ /g, "-").replace(/'/g, "").toLowerCase();

    puppeteer.launch().then(async browser => {
        const promises = [];
        const images = [];
        
        viewports.forEach((vp, index) => {
            promises.push(browser.newPage().then(async page => {
                await page.goto(pages[i].url, { timeout: 0 });
                await page.setViewport({width: vp, height: 1});
                await page.screenshot({
                    path: vpdir + i + '-' + index + '-' + vp + 'px-' + imageName + '.png',
                    fullPage: true
                });
                await images.push(i + '-' + index + '-' + vp + 'px-' + imageName + '.png');
                await page.close();
            }));
        });

        scrapestatus += 1;

        await Promise.all(promises).then(function(){
            let imagesWidth = [];
            let imagesHeight = [];
            
            images.sort((a, b) => a.localeCompare(b));
            images.forEach(img => {
                let imageDimension = sizeOf(path.join(__dirname, 'vpscreens', img));
                imagesWidth.push(imageDimension.width);
                imagesHeight.push(imageDimension.height);
            })

            let finalWidth = imagesWidth.reduce(function(a, b) {
                return a + b;
            }, 0);
            let finalHeight = Math.max(...imagesHeight);

            // console.log('finalWidth', finalWidth);
            // console.log('finalHeight', finalHeight);

            let Image = Canvas.Image;
            let canvas = Canvas.createCanvas(finalWidth, finalHeight);
            let ctx = canvas.getContext('2d');
            let xpos = 0;
            let singleImg;

            // console.log('images', images);
            // console.log('---');
            // console.log('imagesWidth', imagesWidth);
            // console.log('---');

            images.forEach((img, i) => {
                // Draw images in the canvas 
                xpos += (imagesWidth[i - 1]) ? imagesWidth[i - 1] + 20 : 0;
                singleImg = new Image();
                singleImg.src = fs.readFileSync(path.join(__dirname, 'vpscreens', img));
                ctx.drawImage(singleImg, xpos, 0);

                // console.log('img', img);
                // console.log('imagesWidth[i - 1]', imagesWidth[i - 1]);
                // console.log('xpos', xpos);
            });

            canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'pgscreens', (scrapestatus - 1) + '-' + imageName + '.png')));

            if ( scrapestatus != pages.length ) {
                screenscrape(scrapestatus);
            } else {
                console.log(' -- Screenscrape has finished!');
            }
        });

        browser.close();
    });
}

screenscrape(scrapestatus);
