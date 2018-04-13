const cheerio = require('cheerio');
const fetch = require('node-fetch');

module.exports = ({ knex }) => async (req, res) => {
  const links = [];

  try {
    let url = req.query.url;
    if (!url.startsWith('http://')) {
      url = `http://${url}`;
    }

    const html = await fetch(url).then(res => res.text());
    const $ = cheerio.load(html);

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
  } catch (e) {}

  if (req.accepts('text/html')) {
    res.render('search', { url: req.query.url, links });
  } else {
    res.send({ links });
  }
};
