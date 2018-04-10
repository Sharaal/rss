# Milestones

## Open

* Get rid of `knex`, try another ORM or directly use `pg`

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
