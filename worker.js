require('dotenv-safe').config();
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const knex = require('knex')(require('./knexfile')[process.env.NODE_ENV]);

const Parser = require('rss-parser');
const parser = new Parser();

(async function worker() {
  const now = new Date();

  const feeds = await knex('feeds').select();
  for (const feed of feeds) {
    if (feed.fetched_at && feed.ttl) {
      const diffMinutes = (now.getTime() - new Date(feed.fetched_at).getTime()) / 1000 / 60;
      if (diffMinutes < feed.ttl) {
        continue;
      }
    }

    const newFeed = await parser.parseURL(feed.url);

    await knex('feeds')
      .update({
        fetched_at: now,
        title: newFeed.title,
        link: newFeed.link,
        description: newFeed.description,
        ttl: 1,
      })
      .where('id', feed.id);

    await Promise.all(newFeed.items
      .map(async item => {
        try {
          await knex('feed_items').insert({
            feed_id: feed.id,
            title: item.title,
            link: item.link,
            description: item.content,
            guid: item.guid,
            pub_date: new Date(),
          });
        } catch (e) {}
      }));
  }

  setTimeout(worker, 10 * 1000);
})();
