const puppeteer = require('puppeteer');
const fs = require('fs');
const sizeOf = require('image-size');
const path = require('path');
const Canvas = require('canvas');
const ora = require('ora');
const chalk = require('chalk');
const leftPad = require('left-pad');

const pages = require('./pages.json');

const viewportsDir = './vpscreens/';
const pagesDir = './pgscreens/';
const viewports = [375, 768, 1280];
let scrapestatus = 0;

if ( !fs.existsSync(viewportsDir) ){
    fs.mkdirSync(viewportsDir);
}

if ( !fs.existsSync(pagesDir) ){
    fs.mkdirSync(pagesDir);
}

let screenscrape = function(i) {
    const spinner = ora('[' + leftPad((scrapestatus + 1), String(pages.length).length, 0) + ' of ' + pages.length + '] - ' + chalk.yellow(pages[i].title));
    spinner.color = 'yellow';
    spinner.start()
    let imageName = pages[i].title.replace(/ /g, '-').replace(/'/g, '').toLowerCase();

    puppeteer.launch().then(async browser => {
        const promises = [];
        const images = [];
        
        viewports.forEach((vp, index) => {
            promises.push(browser.newPage().then(async page => {
                await page.goto(pages[i].url, { timeout: 0 });
                await page.setViewport({width: vp, height: 1});
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                  })
                // await page.setDefaultNavigationTimeout(5000)
                await page.screenshot({
                    path: viewportsDir + (i + 1) + '-' + index + '-' + vp + 'px-' + imageName + '.png',
                    fullPage: true
                });
                await images.push((i + 1) + '-' + index + '-' + vp + 'px-' + imageName + '.png');
                await page.close();
                await function() {
                    return console.log('await!');
                }
            }));
        });

        scrapestatus += 1;

        await Promise.all(promises).then(function(){
            let imagesWidth = [];
            let imagesHeight = [];
            
            images.sort((a, b) => a.localeCompare(b));
            images.forEach(img => {
                let imageDimension = sizeOf(path.join(__dirname, viewportsDir.replace(/[/.]/g, ''), img));
                imagesWidth.push(imageDimension.width);
                imagesHeight.push(imageDimension.height);
            })

            let finalWidth = imagesWidth.reduce(function(a, b) { return a + b }, 0);
            let finalHeight = Math.max(...imagesHeight);
            let Image = Canvas.Image;
            let canvas = Canvas.createCanvas(finalWidth, finalHeight);
            let ctx = canvas.getContext('2d');
            let xpos = 0;
            let singleImg;

            images.forEach((img, i) => {
                xpos += (imagesWidth[i - 1]) ? imagesWidth[i - 1] + 20 : 0;
                singleImg = new Image();
                singleImg.src = fs.readFileSync(path.join(__dirname, viewportsDir.replace(/[/.]/g, ''), img));
                ctx.drawImage(singleImg, xpos, 0);
            });

            canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, pagesDir.replace(/[/.]/g, ''), scrapestatus + '-' + imageName + '.png')));
            spinner.succeed('[' + leftPad(scrapestatus, String(pages.length).length, 0) + ' of ' + pages.length + '] - ' + chalk.green(pages[i].title));

            if ( scrapestatus != pages.length ) {
                screenscrape(scrapestatus);
            } else {
                spinner.stop();
                console.log('');
            }
        });

        browser.close();
    });
}

screenscrape(scrapestatus);
