module.exports = ({ knex }) => async (req, res) => {
  res.set('Content-Type', 'application/xml');
  res.render('settings/opml', { layout: false });
};
