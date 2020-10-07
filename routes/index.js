const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');

// Passport requirements
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
let crypto = require('crypto');

// Passport middleware
passport.use(new LocalStrategy(
  function(username, password, cb) {
    User.findOne({ username: username })
      .then((user) => {
        if (!user) { return cb(null, false) }
        
        // Function defined at bottom of app.js
        const isValid = validPassword(password, user.hash, user.salt);
        
        if (isValid) {
            return cb(null, user);
        } else {
            return cb(null, false);
        }
      })
      .catch((err) => {   
          cb(err);
      });
}));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

// GET Show info from the DB
router.get('/', async (req, res) => {
  let data = await Post.find({})/*.limit(10)*/.catch(err => console.log(err));
  console.log(JSON.stringify(data));
  res.render('data', { data: data });
});

// GET Retrieve new post form 
router.get('/new', (req, res) => {
  res.render('post_form');
});

// POST Send new post data 
router.post('/new', (req, res, next) => {
  console.log(req.body);
  let post = new Post( 
  {
   content: req.body.content, 
   author: req.body.author,   
  });
  post.save(function(err) {
    if (err) {return next(err);}
    res.send('Success');
  });
});

// GET Login page
router.get('/login', (req, res, next) => {
  res.render('login');
});

// POST Login page
router.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: '/login-success' }), (err, req, res, next) => {
  if (err) next(err);
});

// GET Create a space to register new users
router.get('/register', (req, res, next) => {
  res.render('register');
});

router.post('/register', (req, res, next) => {
    
  const saltHash = genPassword(req.body.password);
  
  const salt = saltHash.salt;
  const hash = saltHash.hash;
  const newUser = new User({
      username: req.body.username,
      hash: hash,
      salt: salt,
  });
  newUser.save()
      .then((user) => {
          console.log(user);
      });
  res.redirect('/');
});

router.get('/unauthorized', (req, res) => {
  res.render('unauthorized');
});

router.get('/protected-route', (req, res, next) => {
  console.log(req.session);
  if (req.isAuthenticated()) {
      res.send('<h1>You are authenticated</h1>');
  } else {
      res.send('<h1>You are not authenticated</h1>');
  }
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/login');
});
router.get('/login-success', (req, res, next) => {
  console.log(req.session);
  res.send('You successfully logged in.');
});
router.get('/login-failure', (req, res, next) => {
  res.send('You entered the wrong password.');
});

// Passport password helper functions
function validPassword(password, hash, salt) {
  let hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}

function genPassword(password) {
  let salt = crypto.randomBytes(32).toString('hex');
  let genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

  return {
    salt: salt,
    hash: genHash
  };
}


module.exports = router;
