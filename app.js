const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config();
const indexRouter = require('./routes/index.js');
const usersRouter = require('./routes/users.js');
require('./db.js');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 5000;

// Authentication packages
const session = require('express-session');
const passport = require('passport');
const MySQLStore = require('express-mysql-session')(session);
const LocalStrategy = require('passport-local').Strategy;

var options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  socketPath: '/tmp/mysql.sock'
};

var sessionStore = new MySQLStore(options);

// view engine ejs
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(session({
  secret: 'super secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  // cookie: {
  //   secure: true
  // }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

passport.use(new LocalStrategy((username, password, done) => {
  console.log(username);
  const db = require('./db');

  db.query('SELECT id, password FROM users WHERE username = ?', [username], (err, results, fields) => {
    if(err) throw err;

    if(results.length === 0 ) {
      return done(null, false);
    } else {
      const hash = results[0].password.toString();
      bcrypt.compare(password, hash, (err, response) => {
        if(response === true) {
          done(null, {user_id: results[0].id});
          return;
        } else {
          return done(null, false)
        }
      });
      return done(null, 'test');
    }
  });
}));

// app.use((req, res, next) => {
//   const err = new Error('Not found');
//   err.status = 404;
//   next(err);
// });

app.listen(port);