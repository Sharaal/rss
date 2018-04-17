module.exports = ({ knex }) => async (req, res) => {
  await knex.raw(
    `INSERT INTO user_feed_item_reads (user_id, feed_item_id)
      SELECT
        :user_id as user_id,
        feed_items.id
      FROM
        user_feed_subscriptions
        INNER JOIN feed_items ON
          feed_items.feed_id = user_feed_subscriptions.feed_id
        LEFT JOIN user_feed_item_reads ON
         user_feed_item_reads.user_id = user_feed_subscriptions.user_id
         AND
         user_feed_item_reads.feed_item_id = feed_items.id
      WHERE
        user_feed_subscriptions.user_id = :user_id
        AND
        user_feed_item_reads.feed_item_id IS NULL
        AND
        feed_items.id <= :feed_item_id`,
    { user_id: req.user.id, feed_item_id: +req.body.max_feed_item_id }
  );

  if (req.accepts('text/html')) {
    req.flash('success', 'successfully marked all as read');
    res.redirect('/');
  } else {
    res.send();
  }
};
