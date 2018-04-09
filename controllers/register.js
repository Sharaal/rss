const bcrypt = require('bcrypt');

module.exports = ({ betakey, knex }) => async (req, res) => {
  if (betakey && betakey !== req.body.betakey) {
    req.flash('error', 'incorrect betakey');
    res.redirect('/');
  }

  let user;
  if (knex.client.config.client === 'pg') {
    user = { id: (await knex('users').insert({ name: req.body.name }).returning('id'))[0] };
  } else {
    user = { id: (await knex('users').insert({ name: req.body.name }))[0] };
  }

  const password = await bcrypt.hash(req.body.password, 10);
  await knex('user_emails').insert({ user_id: user.id, email: req.body.email, password });

  if (req.accepts('text/html')) {
    req.flash('success', 'successfully registered');
    res.redirect('/');
  } else {
    res.send();
  }
};
