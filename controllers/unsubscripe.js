module.exports = ({ knex }) => async (req, res) => {
  const feed_id = +req.body.feed_id;

  await knex('user_feed_subscriptions').delete().where({ user_id: req.user.id, feed_id });

  await knex.raw(
    'DELETE FROM user_feed_item_reads WHERE user_id = :user_id AND feed_item_id IN (SELECT id FROM feed_items WHERE feed_id = :feed_id)',
    { user_id: req.user.id, feed_id }
  );

  const count = (await knex.dQuery(
    'SELECT count(*) AS count FROM user_feed_subscriptions WHERE feed_id = :feed_id',
    { feed_id }
  ))[0];
  if (count.count === 0) {
    await knex('feed_items').delete().where({ feed_id });
    await knex('feeds').delete().where({ id: feed_id });
  }

  if (req.accepts('text/html')) {
    req.flash('success', 'successfully unsubscriped');
    res.redirect(req.body.redirect || '/');
  } else {
    res.send();
  }
};
