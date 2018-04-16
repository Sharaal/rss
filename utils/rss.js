const Parser = require('rss-parser');
const parser = new Parser({
  customFields: {
    feed: ['image', 'ttl'],
  },
});

module.exports = async url => await parser.parseURL(url);
