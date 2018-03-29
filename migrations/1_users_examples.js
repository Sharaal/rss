module.exports.up = knex => knex('users').insert({
  id: 1,
  name: 'Sharaal',
});

module.exports.down = knex => knex('users').delete();
