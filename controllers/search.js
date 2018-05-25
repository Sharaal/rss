const cheerio = require('cheerio');
const fetch = require('node-fetch');
const { URL } = require('url');

module.exports = ({ knex, parser }) => async (req, res) => {
  const links = [];

  const subscripedUrls = [];
  for (const feed of Object.values(res.locals.feeds)) {
    subscripedUrls.push(feed.url);
  }

  try {
    let search = req.query.search;
    if (!search.includes('://')) {
      search = `http://${search}`;
    }

    const body = await fetch(search).then(res => {
      search = res.url;
      return res.text();
    });

    if (body.startsWith('<?xml') && body.includes('<rss')) {
      links.push({
        url: search,
        subscriped: subscripedUrls.includes(search),
      });

      await Promise.all(links.map(async link => {
        const feed = await parser.parseString(body);
        link.title = feed.title;
        link.description = feed.description;
        link.items = feed.items;
        if (feed.image) {
          link.image = feed.image.url[0];
        }
      }));
    } else {
        const $ = cheerio.load(body);

        if (body.startsWith('<?xml') && body.includes('<opml')) {
          console.log('it is an opml');
          $('outline[type=rss]').map((_, outline) => {
            outline = $(outline);
            const url = outline.attr('xmlurl');
            links.push({
              url,
              title: outline.attr('text'),
              subscriped: subscripedUrls.includes(url),
            });
          });
        } else {
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
        }

        await Promise.all(links.map(async link => {
          const feed = await parser.parseURL(link.url);
          link.title = feed.title;
          link.description = feed.description;
          link.items = feed.items;
          if (feed.image) {
            link.image = feed.image.url[0];
          }
        }));
    }
  } catch (e) {}

  if (req.accepts('text/html')) {
    res.render('search', { search: req.query.search, links });
  } else {
    res.send({ links });
  }
};
