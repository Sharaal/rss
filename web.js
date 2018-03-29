require('dotenv-safe').config();
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const knex = require('knex')(require('./knexfile')[process.env.NODE_ENV]);

const express = require('express');

const app = express();
app.disable('x-powered-by');

app.use(express.static('www'));

app.engine('handlebars', require('express-handlebars')({ defaultLayout: 'main' }));
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

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    next();
  } else {
    res.redirect('/login');
  }
};

app.get('/', isAuthenticated, (req, res) => {
  res.redirect('/feeds');
});
app.get('/feeds', isAuthenticated, require('./controllers/feeds')({ knex }));
app.get('/login', require('./controllers/login')({ knex }));
app.post('/login', passport.authenticate('login', {
  successRedirect: '/feeds',
  failureFlash: true,
  failureRedirect: '/login',
}));
app.get('/logout', isAuthenticated, (req, res) => {
  req.logout();
  res.redirect('/');
});
app.post('/read', isAuthenticated, require('./controllers/read')({ knex }));
app.post('/subscripe', isAuthenticated, require('./controllers/subscripe')({ knex }));
app.post('/unsubscripe', isAuthenticated, require('./controllers/unsubscripe')({ knex }));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`app listen on port ${port}`);
});
