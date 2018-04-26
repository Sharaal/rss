module.exports.up = knex => knex.schema.table('feed_items', table => {
  table.string('author');
});

module.exports.down = knex => knex.schema.table('feed_items', table => {
  table.dropColumn('author');
});
