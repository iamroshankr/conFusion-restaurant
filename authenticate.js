const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

module.exports.local = passport.use(new LocalStrategy(User.authenticate()));
// the LocalStrategy requires a verify function as a parameter
// and user.authenticate function automatically verifies username and pwd

// following two lines take care of whatever is required for supporting sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());