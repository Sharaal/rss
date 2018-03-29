module.exports.up = knex => knex.schema.createTable('user_feed_item_reads', table => {
  table.increments();

  table.integer('user_id').unsigned().notNullable();
  table.foreign('user_id').references('id').inTable('users');

  table.integer('feed_item_id').unsigned().notNullable();
  table.foreign('feed_item_id').references('id').inTable('feed_items');
});

module.exports.down = knex => knex.schema.dropTable('user_feed_item_reads');
