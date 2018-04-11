const bcrypt = require('bcrypt');

module.exports = ({ betakey, knex, logger }) => async (req, res) => {
  if (betakey && betakey !== req.body.betakey) {
    req.flash('error', 'incorrect betakey');
    res.redirect('/');
  }

  logger.debug(`try to add new user with name "${req.body.name}"`);
  const user = await knex.dInsert('users', { name: req.body.name });

  logger.debug(`try to add new email "${req.body.email}" to the new user with name "${req.body.name}"`);
  const password = await bcrypt.hash(req.body.password, 10);
  await knex('user_emails').insert({ user_id: user.id, email: req.body.email, password });

  if (req.accepts('text/html')) {
    logger.info(`new user with name "${req.body.name}" and email "${req.body.email}" successfully registered`);
    req.flash('success', 'successfully registered');
    res.redirect('/');
  } else {
    res.send();
  }
};
