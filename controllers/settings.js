module.exports = ({ knex }) => async (req, res) => {
  if (req.accepts('text/html')) {
    res.render('settings');
  } else {
    res.send();
  }
};
