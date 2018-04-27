module.exports.up = knex => knex.schema.createTable('feeds', table => {
  table.increments();

  table.string('url').notNullable();
  table.unique('url');

  table.bigint('fetched_at');

  table.integer('ttl');

  table.string('title');

  table.string('link');

  table.text('description');
});

module.exports.down = knex => knex.schema.dropTable('feeds');
