# Backlog

* Add possibility to read later (mark feed items to read later and filter only for them)
* Support HTML encoded descriptions of feed items, care about large images
* Pagination for the feed items
  * Settings like the amount of feed items per page
* Move the deletion of subscriptions into the settings area
* Add possibility to filter feed items by:
  * Feed
  * Category
  * All feed items, also the already read

# Known bugs

* PK in `feed_items` only with `guid` is not good, better use combined PK with `feed_id` and `guid` and omit duplicate `guid` in the output if multiple feeds are shown
* Error handling (e.g. duplicate registrations, duplicate subscriptions)
* Get rid of `knex`, try another ORM or directly use `pg` because of incompatibility with `sqlite3`
