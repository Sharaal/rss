require('dotenv-safe').config();
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const knex = require('knex')(require('./knexfile')[process.env.NODE_ENV]);

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
}
app.use(require('express-session')({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' },
}));
app.use(require('connect-flash')());
const passport = require('passport');
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = (await knex('users').where('id', id))[0];
    if (!user) {
      throw new Error(`missing user with id "${id}"`);
    }
    done(null, user);
  } catch (e) {
    done(e);
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
        throw new Error(`incorrect username`);
      }
      if (password !== user_email.password && !await bcrypt.compare(password, user_email.password)) {
        throw new Error(`incorrect password`);
      }
      const user = (await knex('users').where('id', user_email.user_id))[0];
      if (!user) {
        throw new Error(`missing user with id "${id}"`);
      }
      done(null, user);
    } catch (e) {
      done(e);
    }
  }
));
app.use(passport.initialize());
app.use(passport.session());

app.use(async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.feeds = await knex.raw(
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
    res.locals.user = req.user;
  }
  next();
});

const isAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/home');
  }
};

app.get('/', require('./controllers/home')({ knex }));
app.post('/login', passport.authenticate('login', {
  successRedirect: '/',
  failureFlash: true,
  failureRedirect: '/',
}));
app.post('/logout', isAuthenticated, (req, res) => {
  req.logout();
  res.redirect('/');
});
app.post('/read', isAuthenticated, require('./controllers/read')({ knex }));
app.post('/readall', isAuthenticated, require('./controllers/readall')({ knex }));
app.post('/subscripe', isAuthenticated, require('./controllers/subscripe')({ knex }));
app.post('/unsubscripe', isAuthenticated, require('./controllers/unsubscripe')({ knex }));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`app listen on port ${port}`);
});
