module.exports.up = knex => knex('user_feed_subscriptions').insert({
  user_id: 1,
  feed_id: 1,
  pub_date: new Date(),
});

module.exports.down = knex => knex('user_feed_subscriptions').delete();
