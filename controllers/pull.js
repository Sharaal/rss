module.exports = ({ knex }) => async (req, res) => {
  const feed_id = +req.body.feed_id;

  await knex('feeds').update({ fetched_at: null }).where({ id: feed_id });

  if (req.accepts('text/html')) {
    req.flash('success', 'successfully pull');
    res.redirect(req.body.redirect || '/');
  } else {
    res.send();
  }
};
