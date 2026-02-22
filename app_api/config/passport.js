const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('users');

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  async (username, password, done) => {
    try {
      const user = await User.findOne({ email: username });
      
      // Check if user exists
      if (!user) {
        return done(null, false, {
          message: 'Incorrect username.'
        });
      }

      // Check if password is valid using the method we added to the schema
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Incorrect password.'
        });
      }

      // If everything is correct, return the user object
      return done(null, user);
      
    } catch (err) {
      return done(err);
    }
  }
));