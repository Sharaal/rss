module.exports.up = knex => knex.schema.createTable('users', table => {
  table.increments();

  table.string('name');
});

module.exports.down = knex => knex.schema.dropTable('users');
