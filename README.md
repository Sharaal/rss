# Backlog

* Endpoint allows multiple feed urls and just fetch, order and show the feed items, available also for not authenticated users
* Support Atom feed format
* Add possibility to read later (mark feed items to read later and filter only for them)
* Support HTML encoded descriptions of feed items, care about large images
* Pagination for the feed items
  * Settings like the amount of feed items per page
* Add possibility to filter feed items by:
  * Feed
  * Category
  * All feed items, also the already read

# Known bugs

* PK in `feed_items` only with `guid` is not good, better use combined PK with `feed_id` and `guid` and omit duplicate `guid` in the output if multiple feeds are shown
* Error handling (e.g. duplicate subscriptions)
* Get rid of `knex`, try another ORM or directly use `pg` because of incompatibility with `sqlite3`
* Timestamp datatype in the database is bad for compatibility, better use unix timestamps
* Search with an actual feed will fetch this feed twice, because `rss-parser` not work with the body directly
