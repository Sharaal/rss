module.exports.up = knex => knex.schema.table('feed_items', table => {
  table.dropUnique('guid');
  table.unique(['feed_id', 'guid']);
});

module.exports.down = knex => knex.schema.table('feed_items', table => {
  table.dropUnique(['feed_id', 'guid']);
  table.unique('guid');
});
