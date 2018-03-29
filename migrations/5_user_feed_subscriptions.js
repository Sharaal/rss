module.exports.up = knex => knex.schema.createTable('user_feed_subscriptions', table => {
  table.increments();

  table.integer('user_id').unsigned().notNullable();
  table.foreign('user_id').references('id').inTable('users');

  table.integer('feed_id').unsigned().notNullable();
  table.foreign('feed_id').references('id').inTable('feeds');

  table.unique(['user_id', 'feed_id']);

  table.timestamp('pub_date').notNullable();
});

module.exports.down = knex => knex.schema.dropTable('user_feed_subscriptions');
