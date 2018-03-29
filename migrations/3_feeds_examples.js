module.exports.up = knex => knex('feeds').insert({
  id: 1,
  url: 'http://www.maxdome-rssfeeds.de/store-movies',
});

module.exports.down = knex => knex('feeds').delete();
