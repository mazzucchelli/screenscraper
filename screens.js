const puppeteer = require('puppeteer');
const fs = require('fs');
const sizeOf = require('image-size');
const path = require('path');
const Canvas = require('canvas');
const ora = require('ora');
const chalk = require('chalk');
const leftPad = require('left-pad');
const compress_images = require('compress-images');
var rimraf = require("rimraf");

const pages = require('./pages.json');
const configs = require('./configs.json');
const { vp_screens, pg_screens } = configs.paths;

const vpFolder = vp_screens && vp_screens !== "" ? vp_screens : false;
const pgFolder = pg_screens && pg_screens !== "" ? pg_screens : false;
const viewports = configs.viewports;

rimraf(vpFolder, function () {
    fs.mkdirSync(vpFolder)
})

rimraf(pgFolder, function () {
    fs.mkdirSync(pgFolder);
})

const compressImages = async () => {
    const input = 'pgscreens/*.png';
    const output = 'screens/';

    compress_images(input, output, { compress_force: false, statistic: true, autoupdate: true }, false,
        { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
        { png: { engine: 'pngquant', command: ['--quality=45-65'] } },
        { svg: { engine: 'svgo', command: '--multipass' } },
        { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } }, function () { }
    );
}

const takeScreen = async (page, dir, i, j, vp, imageName) => {
    if (dir) {
        await page.screenshot({
            path: dir + (i + 1) + '-' + j + '-' + vp + 'px-' + imageName + '.png',
            fullPage: true
        })
    }
}

let scrapestatus = 0;
let screenscrape = function (i) {
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
                await page.setViewport({ width: vp, height: 1 });
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                })
                // await page.setDefaultNavigationTimeout(5000)
                await takeScreen(page, vpFolder, i, index, vp, imageName);
                await images.push((i + 1) + '-' + index + '-' + vp + 'px-' + imageName + '.png');
                await page.close();
                await function () {
                    return console.log('await!');
                }
            }));
        });

        scrapestatus += 1;

        await Promise.all(promises).then(function () {
            let imagesWidth = [];
            let imagesHeight = [];

            images.sort((a, b) => a.localeCompare(b));
            images.forEach(img => {
                let imageDimension = sizeOf(path.join(__dirname, vpFolder.replace(/[/.]/g, ''), img));
                imagesWidth.push(imageDimension.width);
                imagesHeight.push(imageDimension.height);
            })

            let finalWidth = imagesWidth.reduce(function (a, b) { return a + b }, 0);
            let finalHeight = Math.max(...imagesHeight);
            let Image = Canvas.Image;
            let canvas = Canvas.createCanvas(finalWidth, finalHeight);
            let ctx = canvas.getContext('2d');
            let xpos = 0;
            let singleImg;

            images.forEach((img, i) => {
                xpos += (imagesWidth[i - 1]) ? imagesWidth[i - 1] + 20 : 0;
                singleImg = new Image();
                singleImg.src = fs.readFileSync(path.join(__dirname, vpFolder.replace(/[/.]/g, ''), img));
                ctx.drawImage(singleImg, xpos, 0);
            });

            if (pgFolder) {
                canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, pgFolder.replace(/[/.]/g, ''), scrapestatus + '-' + imageName + '.png')));
            }
            spinner.succeed('[' + leftPad(scrapestatus, String(pages.length).length, 0) + ' of ' + pages.length + '] - ' + chalk.green(pages[i].title));

            if (scrapestatus != pages.length) {
                screenscrape(scrapestatus);
            } else {
                compressImages();
                spinner.stop();
                console.log('');
            }
        });

        browser.close();
    });
}

screenscrape(scrapestatus);
