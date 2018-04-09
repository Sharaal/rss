module.exports = ({ knex }) => async (req, res) => {
  let feed = (await knex('feeds').select().where('url', req.body.url))[0];
  if (!feed) {
    if (knex.client.config.client === 'pg') {
      feed = (await knex('feeds').insert({ url: req.body.url, title: req.body.url }).returning('id'))[0];
    } else {
      feed = { id: (await knex('feeds').insert({ url: req.body.url, title: req.body.url }))[0] };
    }
  }

  await knex('user_feed_subscriptions').insert({ user_id: req.user.id, feed_id: feed.id, pub_date: new Date() });

  if (req.accepts('text/html')) {
    req.flash('success', 'successfully subscriped');
    res.redirect('/');
  } else {
    res.send();
  }
};
