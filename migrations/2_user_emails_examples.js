module.exports.up = knex => knex('user_emails').insert({
  user_id: 1,
  email: 'example@example.com',
  password: 'example',
});

module.exports.down = knex => knex('user_emails').delete();
