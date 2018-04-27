module.exports.up = knex => knex.schema.createTable('feed_items', table => {
  table.increments();

  table.integer('feed_id').unsigned().notNullable();
  table.foreign('feed_id').references('id').inTable('feeds');

  table.string('title');

  table.string('link');

  table.text('description');

  table.string('categories');

  table.string('image');

  table.string('author');

  table.string('guid').notNullable();
  table.unique('guid');

  table.integer('pub_date').notNullable();
});

module.exports.down = knex => knex.schema.dropTable('feed_items');
