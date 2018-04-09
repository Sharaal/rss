module.exports = ({ knex }) => async (req, res) => {
  if (req.isAuthenticated()) {

    // TODO: query params to support pagination
    // TODO: query param to list also all already read feed items
    // TODO: query param to list only feed items of a specified feed

    const feed_items = await knex.dQuery(
      `SELECT
        feed_items.*
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
        ORDER BY
          feed_items.pub_date DESC`,
      { user_id: req.user.id }
    );

    if (req.accepts('text/html')) {
      res.render('feeds', { feed_items });
    } else {
      res.send(feed_items);
    }
  } else {
    if (req.accepts('text/html')) {
      res.render('home');
    } else {
      res.send();
    }
  }
};
