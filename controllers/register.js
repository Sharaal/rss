const bcrypt = require('bcrypt');

module.exports = ({ betakey, knex, logger }) => async (req, res) => {
  if (betakey && betakey !== req.body.betakey) {
    req.flash('error', 'incorrect betakey');
    res.redirect('/');
  }

  try {
    await knex.transaction(async trx => {
      logger.debug(`try to add new user with name "${req.body.name}"`);
      const user = await knex.dInsert('users', { name: req.body.name }, trx);

      logger.debug(`try to add new email "${req.body.email}" to the new user with name "${req.body.name}"`);
      const password = await bcrypt.hash(req.body.password, 10);
      await knex.dInsert('user_emails', { user_id: user.id, email: req.body.email, password }, trx);
    });

    if (req.accepts('text/html')) {
      logger.info(`new user with name "${req.body.name}" and email "${req.body.email}" successfully registered`);
      req.flash('success', 'successfully registered');
      res.redirect(req.body.redirect || '/');
    } else {
      res.send();
    }
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT') {
      logger.debug(`email "${req.body.email}" for new user with name "${req.body.name}" already registered`);
      req.flash('error', `email "${req.body.email}" already registered`);
      res.redirect(req.body.redirect || '/');
    } else {
      throw e;
    }
  }
};
