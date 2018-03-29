module.exports.up = knex => knex.schema.createTable('user_emails', table => {
  table.increments();

  table.integer('user_id').unsigned().notNullable();
  table.foreign('user_id').references('id').inTable('users');
  table.unique('user_id');

  table.string('email').notNullable();
  table.unique('email');

  table.string('password').notNullable();
});

module.exports.down = knex => knex.schema.dropTable('user_emails');
