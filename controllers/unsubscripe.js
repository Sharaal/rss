module.exports = ({ knex }) => async (req, res) => {
  await knex('user_feed_subscriptions').delete({ user_id: req.user.id, feed_id: req.body.feed_id });

  await knex.raw(
    'DELETE FROM user_feed_item_reads WHERE user_id = :user_id AND feed_items_id IN (SELECT id FROM feed_items WHERE feed_id = :feed_id)',
    { user_id: req.user.id, feed_id: req.body.feed_id }
  );

  const count = await knex.raw(
    'SELECT count(*) AS count FROM user_feed_subscriptions WHERE feed_id = :feed_id',
    { feed_id: req.body.feed_id }
  )[0];
  if (count.count === 0) {
    await knex('feed_items').delete({ feed_id: req.body.feed_id });
    await knex('feeds').delete({ id: req.body.feed_id });
  }

  if (req.accepts('text/html')) {
    res.redirect('/');
  } else {
    res.send();
  }
};
