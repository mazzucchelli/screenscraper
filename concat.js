/*
const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');
const sizeOf = require('image-size');
const pages = require('./pages.json');

var dir = './pgscreens/';
if ( !fs.existsSync('./pgscreens/') ){
    fs.mkdirSync('./pgscreens/');
}

// Get image dimensions
let img1Dimensions = sizeOf(path.join(__dirname, 'vpscreens', '0-375px-example.png'));
let img2Dimensions = sizeOf(path.join(__dirname, 'vpscreens', '0-768px-example.png'));
let img3Dimensions = sizeOf(path.join(__dirname, 'vpscreens', '0-1280px-example.png'));
let finalWidth = img1Dimensions.width + img2Dimensions.width + img3Dimensions.width + 20;
let finalHeight = Math.max(img1Dimensions.height, img2Dimensions.height, img3Dimensions.height);

// var sum = [0, 1, 2, 3].reduce(function(a, b) {
//     return a + b;
// }, 0);

// Create canvas
let Image = Canvas.Image;
let canvas = Canvas.createCanvas(finalWidth, finalHeight);
let ctx = canvas.getContext('2d');

// Draw images in the canvas 
let img1 = new Image();
img1.src = fs.readFileSync(path.join(__dirname, 'vpscreens', '0-375px-example.png'));
ctx.drawImage(img1, 0, 0);

let img2 = new Image();
img2.src = fs.readFileSync(path.join(__dirname, 'vpscreens', '0-768px-example.png'));
ctx.drawImage(img2, img1.width + 10, 0);

let img3 = new Image();
img3.src = fs.readFileSync(path.join(__dirname, 'vpscreens', '0-1280px-example.png'));
ctx.drawImage(img3, img1.width + img2.width + 20, 0);

canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'pgscreens', '0-example.png')));
*/
new Promise((resolve, reject) => {
    console.log('Initial');
    resolve();
})
.then(() => {
    throw new Error('Something failed');    
    console.log('Do this');
})