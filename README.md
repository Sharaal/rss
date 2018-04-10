# Milestones

## Open

* Add the genres as `category` tags in the maxdome feed, show them as subtitles
* Pagination for the feed items
* Introduce a manage user area (instead of "Logout" button)
  * Settings like the amount of feed items per page
  * Move the deletion of subscriptions into that
* Add possibility to filter feed items by:
  * feed
  * all feed items, also the already read
* Add possibility to read later (mark feed items to read later and filter only for them)

## Achieved

* Project structure with all datastructures / routes and views / features
* Sessions and passport for login/logout
* Worker to fetch all new feed items
* Logic of the controllers to implement the features
* Layout and views for login and feeds
* Flash messages to show errors (e.g. during registration/login) and success feedbacks
* Registration (with Beta Key)

# Known bugs

* PK in `feed_items` only with `guid` is not good, better use combined PK with `feed_id` and `guid` and omit duplicate `guid` in the output if multiple feeds are shown
* Error handling (e.g. duplicate registrations, duplicate subscriptions)
* Get rid of `knex`, try another ORM or directly use `pg` because of incompatibility with `sqlite3`
