const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate  = require('../authenticate');
const cors = require('./cors');

var router = express.Router();
router.use(express.json());

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  
  User.find({}, (err, users) => {
    if(err) {
      next(err);
    }
    else if(!users) {
      const error = new Error('No users found!');
      error.status = 404;
      next(error);
    }
    else {
      res.status = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    }
  });
});

router.post('/signup', cors.corsWithOptions, function(req, res) {

  User.register(new User({username: req.body.username}),
    req.body.password,
    (err, user) => {
      if(err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      }
      else {
        if(req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if(req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user.save( (err, user) => {
          if(err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'Registration Successful!'});
          });
        });
      }
    }
  );
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local', {session: false}), (req, res) => {

  const token = authenticate.getToken({ _id: req.user._id });
  // keep minimum info in the token

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are Successfully logged in!'});  
});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
  if(req.session) {
    req.session.destroy(); //deletes the session from the server side
    res.clearCookie('session-id'); //asking the client to delete the cookie
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
