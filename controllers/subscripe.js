module.exports = ({ knex }) => async (req, res) => {
  let feed = (await knex('feeds').select().where('url', req.body.url))[0];
  if (!feed) {
    feed = await knex('feeds').insert({ url: req.body.url, title: req.body.url }).returning('id');
  }

  await knex('user_feed_subscriptions').insert({ user_id: req.user.id, feed_id: feed.id, pub_date: new Date() });

  if (req.accepts('text/html')) {
    res.redirect('/');
  } else {
    res.send();
  }
};
