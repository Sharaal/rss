module.exports = ({ knex }) => async (req, res) => {
  if (req.accepts('text/html')) {
    res.render('home');
  } else {
    res.send();
  }
};
