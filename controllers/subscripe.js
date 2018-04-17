module.exports = ({ knex }) => async (req, res) => {
  let feed = (await knex('feeds').select().where('url', req.body.url))[0];
  if (!feed) {
    feed = await knex.dInsert('feeds', { url: req.body.url, title: req.body.url });
  }

  await knex('user_feed_subscriptions').insert({ user_id: req.user.id, feed_id: feed.id, pub_date: new Date() });

  if (req.accepts('text/html')) {
    req.flash('success', 'successfully subscriped');
    res.redirect(req.body.redirect || '/');
  } else {
    res.send();
  }
};
