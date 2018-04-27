module.exports = ({ knex }) => async (req, res) => {
  try {
    await knex('user_feed_item_reads').insert({
      user_id: req.user.id,
      feed_item_id: +req.body.feed_item_id,
    });
  } catch (e) {
    if (e.code !== 'SQLITE_CONSTRAINT') {
      throw e;
    }
  }

  if (req.accepts('text/html')) {
    res.redirect(req.body.redirect || '/');
  } else {
    res.send();
  }
};
