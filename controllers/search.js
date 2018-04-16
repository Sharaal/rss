const cheerio = require('cheerio');
const fetch = require('node-fetch');
const rss = require('../utils/rss');
const { URL } = require('url');

module.exports = ({ knex }) => async (req, res) => {
  const links = [];

  const subscripedUrls = [];
  for (const feed of Object.values(res.locals.feeds)) {
    subscripedUrls.push(feed.url);
  }

  try {
    let search = req.query.search;
    if (!search.startsWith('http://')) {
      search = `http://${search}`;
    }

    const html = await fetch(search).then(res => {
      search = res.url;
      return res.text();
    });
    const $ = cheerio.load(html);

    $('link[rel="alternate"][type="application/rss+xml"]').map((_, link) => {
      link = $(link);
      const href = link.attr('href');
      let url;
      if (href.includes('://')) {
        url = href;
      } else {
        url = new URL(href, search).toString();
      }
      links.push({
        url,
        title: link.attr('title'),
        subscriped: subscripedUrls.includes(url),
      });
    });

    await Promise.all(links.map(async link => {
      const feed = await rss(link.url);
      link.title = feed.title;
      link.description = feed.description;
      link.items = feed.items;
      if (feed.image) {
        link.image = feed.image.url[0];
      }
    }));
  } catch (e) {}

  if (req.accepts('text/html')) {
    res.render('search', { search: req.query.search, links });
  } else {
    res.send({ links });
  }
};
