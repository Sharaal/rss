module.exports.up = knex => knex.schema.table('user_feed_item_reads', table => {
  table.unique(['user_id', 'feed_item_id']);
});

module.exports.down = knex => knex.schema.table('user_feed_item_reads', table => {
  table.dropUnique(['user_id', 'feed_item_id']);
});
