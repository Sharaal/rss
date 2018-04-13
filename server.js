require('dotenv-safe').config();
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const winston = require('winston');
const logger = new winston.Logger({
  level: process.env.LOG_LEVEL,
  transports: [new winston.transports.Console({
    timestamp: process.env.NODE_ENV !== 'production',
    colorize: process.env.NODE_ENV !== 'production',
  })],
});

const knex = require('knex')(require('./knexfile')[process.env.NODE_ENV]);

knex.dInsert = async (table, data) => {
  logger.debug(`dInsert with table "${table}" and data "${JSON.stringify(data)}"`);
  if (knex.client.config.client === 'pg') {
    const pgResult = await knex(table).insert(data).returning('id');
    logger.debug(`dInsert result "${JSON.stringify(pgResult)}"`);
    return { id: pgResult[0] };
  }
  const result = await knex(table).insert(data);
  logger.debug(`dInsert result "${JSON.stringify(result)}"`);
  return { id: result[0] };
};

knex.dQuery = async (sql, params) => {
  if (knex.client.config.client === 'pg') {
    return (await knex.raw(sql, params)).rows;
  }
  return await knex.raw(sql, params);
};

const express = require('express');

const app = express();
app.disable('x-powered-by');

app.use(express.static('www'));

const moment = require('moment');
app.engine('handlebars', require('express-handlebars').create({
  defaultLayout: 'main',
  helpers: {
    formatRelative: date => moment.duration(moment(date).diff()).humanize(true),
  }
}).engine);
app.set('view engine', 'handlebars');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    console.log(req.secure);
    console.log(req.headers['x-forwarded-proto']);
    if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
      console.log('redirect', `https://${req.headers['host']}${req.url}`);
      res.redirect(`https://${req.headers['host']}${req.url}`);
    }
    console.log('next');
    next();
  });
}

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
app.use(session({
  store: new RedisStore({ url: process.env.REDIS_URL }),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' },
}));

app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.flashs = req.flash();
  next();
});
const passport = require('passport');
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = (await knex('users').where('id', id))[0];
    if (!user) {
      const message = `missing user with id "${id}"`;
      logger.warning(message);
      throw new Error(message);
    }
    done(null, user);
  } catch (e) {
    done(null, null, e.message);
  }
});
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local');
passport.use('login', new LocalStrategy(
  {
    passReqToCallback : true,
    usernameField: 'email',
  },
  async (req, email, password, done) => {
    try {
      const user_email = (await knex('user_emails').where('email', email))[0];
      if (!user_email) {
        throw new Error(`incorrect email`);
      }
      if (password !== user_email.password && !await bcrypt.compare(password, user_email.password)) {
        throw new Error(`incorrect password`);
      }
      const user = (await knex('users').where('id', user_email.user_id))[0];
      if (!user) {
        const message = `missing user with id "${id}"`;
        logger.warning(message);
        throw new Error(message);
      }
      done(null, user);
    } catch (e) {
      done(null, null, e.message);
    }
  }
));
app.use(passport.initialize());
app.use(passport.session());

const Parser = require('rss-parser');
const parser = new Parser();
app.use(async (req, res, next) => {
  if (req.isAuthenticated()) {
    const now = new Date();

    const rows = await knex.dQuery(
      `SELECT
        feeds.*
        FROM
          user_feed_subscriptions
          INNER JOIN feeds ON
            feeds.id = user_feed_subscriptions.feed_id
        WHERE
          user_feed_subscriptions.user_id = :user_id`,
      { user_id: req.user.id }
    );
    const feeds = {};
    for (const record of rows) {
      feeds[record.id] = record;
    }
    for (const feed of Object.values(feeds)) {
      if (feed.fetched_at && feed.ttl) {
        const diffMinutes = (now.getTime() - new Date(feed.fetched_at).getTime()) / 1000 / 60;
        if (diffMinutes < feed.ttl) {
          continue;
        }
      }

      logger.info(`fetch feed items for feed "${feed.title} with ID ${feed.id}" and URL ${feed.url}`);

      try {
        const newFeed = await parser.parseURL(feed.url);
        feed.title = newFeed.title;

        await knex('feeds')
          .update({
            fetched_at: now,
            title: newFeed.title,
            link: newFeed.link,
            description: newFeed.description,
            ttl: 1,
          })
          .where('id', feed.id);

        await Promise.all(newFeed.items
          .map(async item => {
            try {
              await knex('feed_items').insert({
                feed_id: feed.id,
                title: item.title,
                link: item.link,
                description: item.content,
                categories: item.categories ? item.categories.join(', ') : null,
                image: item.enclosure && item.enclosure.type.startsWith('image/') ? item.enclosure.url : null,
                guid: item.guid,
                pub_date: new Date(),
              });
              logger.info(`new feed item "${item.title}" for feed "${feed.title} with ID ${feed.id}" and URL ${feed.url}`);
            } catch (e) {}
          }));
      } catch (e) {}
    }
    res.locals.feeds = feeds;
    res.locals.user = req.user;
  } else {
    res.locals.betakey = { env: process.env.BETAKEY, query: req.query.betakey };
  }
  next();
});

const isAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
};

app.get('/', require('./controllers/home')({ knex, logger }));
app.post('/register', require('./controllers/register')({ betakey: process.env.BETAKEY, knex, logger }));
app.post('/login', passport.authenticate('login', {
  successRedirect: '/',
  failureFlash: true,
  failureRedirect: '/',
}));
app.post('/logout', isAuthenticated, (req, res) => {
  req.logout();
  res.redirect('/');
});
app.post('/read', isAuthenticated, require('./controllers/read')({ knex, logger }));
app.post('/readall', isAuthenticated, require('./controllers/readall')({ knex, logger }));
app.get('/search', isAuthenticated, require('./controllers/search')({ knex, logger }));
app.post('/subscripe', isAuthenticated, require('./controllers/subscripe')({ knex, logger }));
app.post('/unsubscripe', isAuthenticated, require('./controllers/unsubscripe')({ knex, logger }));

const port = process.env.PORT;
app.listen(port, () => {
  logger.info(`app listen on port ${port}`);
});
