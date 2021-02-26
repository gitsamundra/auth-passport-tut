const express = require('express');
const connection = require('../db.js');
const expressValidator = require('express-validator');
const bcrypt = require('bcrypt');
const passport = require('passport');
const saltRounds = 10;

const indexRouter = express.Router();

const authenticationMiddleWare = () => {
  return (req, res, next) => {
    if(req.isAuthenticated()) return next();

    res.redirect('/login');
  };
};

// GET home page
indexRouter.get('/', (req, res) => {
  console.log(req.user);
  console.log(req.isAuthenticated());
  res.render('home', {title: 'Home'})
});

indexRouter.get('/profile', authenticationMiddleWare(), (req, res) => {
  res.render('profile', {title: 'Profile'});
});

indexRouter.get('/login', (req, res) => {
  res.render('login', {title: 'Login'})
});

indexRouter.get('/register', (req, res) => {
 
  res.render('register', {title: 'Registration'});
});

indexRouter.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}));

indexRouter.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

indexRouter.post('/register', (req, res) => {
  // req.checkBody('username', 'Username field cannot be empty.')
  // const errors = req.validationErrors();

  // if(errors)  {
  //   console.log(`errors: ${JSON.stringify(errors)}`);

  //   res.render('register', {title: 'Registration Error'})
  // }

  const { username, email, password } = req.body;

  if(username === '') {
    res.send('Username field cannot be empty.');
  } else {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if(err) throw err;
  
      connection.query('INSERT INTO myDatabase.users (username, email, password) VALUES(?, ?, ?)', [username, email, hash], (err, results) => {
        if(err) throw err;
        
        connection.query('SELECT LAST_INSERT_ID() as user_id', (err, results, fields) => {
          if(err) throw err;
          const user_id = results[0];
          req.login(user_id, (error) => {
            res.redirect('/');
          });
        });
      });
    });
  }
});

passport.serializeUser((user_id, done) => {
  done(null, user_id);
});

passport.deserializeUser((user_id, done) => {
  done(null, user_id);
});

module.exports = indexRouter;