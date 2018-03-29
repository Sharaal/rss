module.exports = ({ knex }) => async (req, res) => {
  await knex('user_feed_item_reads').insert(req.body.feed_item_ids.map(feed_item_id => ({
    user_id: req.user.id,
    feed_item_id,
  })));

  if (req.accepts('text/html')) {
    res.redirect('/');
  } else {
    res.send();
  }
};
