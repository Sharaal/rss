const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async url => await parser.parseURL(url);
