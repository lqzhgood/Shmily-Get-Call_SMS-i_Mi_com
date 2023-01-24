const cheerio = require('cheerio');



exports.htmlToText = function (html) {
    const $ = cheerio.load(html, { decodeEntities: false });
    $("img").replaceWith((i, elm) => {
        const { alt } = elm.attribs;
        return `<span>${alt ? `[${alt}]` : '[图]'}</span>`;
    });
    $("br").replaceWith((i, elm) => {
        return `<span>\n</span>`;
    });

    return $.text();
};