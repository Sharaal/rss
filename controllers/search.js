const cheerio = require('cheerio');
const fetch = require('node-fetch');

module.exports = ({ knex }) => async (req, res) => {
  const html = await fetch(req.query.url).then(res => res.text());
  const $ = cheerio.load(html);

  const links = [];
  $('link[rel="alternate"][type="application/rss+xml"]').map((_, link) => {
    link = $(link);
    const href = link.attr('href');
    let url;
    if (href.includes('://')) {
      url = href;
    } else {
      url = req.query.url + href;
    }
    links.push({ url, title: link.attr('title') });
  });

  if (req.accepts('text/html')) {
    res.render('search', { url: req.query.url, links });
  } else {
    res.send({ links });
  }
};
