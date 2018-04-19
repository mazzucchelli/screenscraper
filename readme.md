# Screenscraper

A Node.js tool that let you take screenshots of multiple urls, in multiple viewports.

From this:

```json
    {
        "title": "Example",
        "url": "http://example.com"
    }
```

To this:

![alt text](https://github.com/mazzucchelli/screenscraper/blob/master/pgscreens/0-example.com.png "example.com merge images")

### Dependencies

* [puppeteer](https://github.com/GoogleChrome/puppeteer)
* [canvas](https://github.com/Automattic/node-canvas)

### Usage

Install everything: `npm i`

Populate `pages.json` file
```json
[
    {
        "title": "Example",
        "url": "http://example.com"
    }, {
        ...
    }
]
```

Run: `npm run start` or `node screens.js`
