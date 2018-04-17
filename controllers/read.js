module.exports = ({ knex }) => async (req, res) => {
  await knex('user_feed_item_reads').insert({
    user_id: req.user.id,
    feed_item_id: +req.body.feed_item_id,
  });

  if (req.accepts('text/html')) {
    res.redirect(req.body.redirect || '/');
  } else {
    res.send();
  }
};
