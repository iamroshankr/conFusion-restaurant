const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const config = require('./config');

module.exports.local = passport.use(new LocalStrategy(User.authenticate()));
// the LocalStrategy requires a verify function as a parameter
// and user.authenticate function automatically verifies username and pwd

// following two lines take care of whatever is required for supporting sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports.getToken = function(user) {
    return jwt.sign(user, 
        config.secretKey,
        {expiresIn: 3600}
    );
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

module.exports.jwtPassport = passport.use(new JwtStrategy(opts, 
    (jwt_payload, done) => {
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if(err) {
                return done(err, false);
            }
            else if(user) {
                return done(null, user);
            }
            else {
                return done(null, false); // user not found
            }
        });
    })
);

module.exports.verifyUser = passport.authenticate('jwt', {session: false});

module.exports.verifyAdmin = (req, res, next) => {
    if(!req.user.admin) {
        const err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        next(err);
    }
    else {
        next();
    }
};