const { Sessions } = require('../models');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports.createSession = (req, res, next) => {
  req.session = {};
  Promise.resolve(req.cookies.shortlyid)
    .then((hash) => {
      if (!hash) { // hash doesn't exist
        throw null;
      } else {
        return Sessions.get({ hash: hash });
      }
    })
    .then((session) => {
      if (session == null) { // hash is not in database
        throw null;
      } else {
        Object.assign(req.session, session);
      }
    })
    .catch((err) => {
      return Sessions.create()
        .then((results) => {
          return Sessions.get({ id: results.insertId });
        })
        .then((session) => {
          req.cookies['shortlyid'] = session.hash;
          // Object.assign(req.session, session);
          req.session.hash = session.hash;
          res.cookie('shortlyid', session.hash);
        });
    })
    .then(() => next());
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.verifySession = (req, res) => {
  if (!Sessions.isLoggedIn(req.session)) {
    res.redirect('/login');
  }
};

// In middleware/auth.js, write a createSession middleware function that accesses the parsed cookies on the request, looks up the user data related to that session, and assigns an object to a session property on the request that contains relevant user information. (Ask yourself: what information about the user would you want to keep in this session object?)
// Things to keep in mind:
// An incoming request with no cookies should generate a session with a unique hash and store it the sessions database. The middleware function should use this unique hash to set a cookie in the response headers. (Ask yourself: How do I set cookies using Express?).
// If an incoming request has a cookie, the middleware should verify that the cookie is valid (i.e., it is a session that is stored in your database).
// If an incoming cookie is not valid, what do you think you should do with that session and cookie?
