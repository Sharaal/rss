module.exports.up = knex => knex.schema.table('feed_items', table => {
  table.string('image');
});

module.exports.down = knex => knex.schema.table('feed_items', table => {
  table.dropColumn('image');
});
