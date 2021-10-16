const {Sessions} = require('../models');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports.createSession = (req, res, next) => {
  req.session = {};
  if (req.cookies != null && req.cookies.shortlyid != null) {
    // Get the session associated with the hash
    // console.log('req cookies are: ', req.cookies);
    Sessions.get({ hash: req.cookies.shortlyid }).then((session) => {
      // console.log('session is:', session);
      let { hash } = session;

      if (session == null) { // The session isn't valid
        // console.log('session is undeifned');
        Sessions.create()
          .then((results) => Sessions.get({ id: results.insertId }))
          .then((session) => {
            // console.log('session is:', session);
            req.cookies.shortlyid = hash;
            req.session.hash = hash;
            // res.clearCookie('shortlyid');
            // res.cookie('shortlyid', hash);
            res.cookies.shortlyid = hash;
            console.log('res cookies', res.cookies);
          });
      } else {
        // The session is valid
        Object.assign(req.session, session);
      }
      next();
    });
  } else {
    Sessions.create()
      .then((results) => Sessions.get({ id: results.insertId }))
      .then((session) => {
        req.cookies['shortlyid'] = session.hash;
        req.session.hash = session.hash;
        res.cookie('shortlyid', session.hash);
        next();
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

// In middleware/auth.js, write a createSession middleware function that accesses the parsed cookies on the request, looks up the user data related to that session, and assigns an object to a session property on the request that contains relevant user information. (Ask yourself: what information about the user would you want to keep in this session object?)
// Things to keep in mind:
// An incoming request with no cookies should generate a session with a unique hash and store it the sessions database. The middleware function should use this unique hash to set a cookie in the response headers. (Ask yourself: How do I set cookies using Express?).
// If an incoming request has a cookie, the middleware should verify that the cookie is valid (i.e., it is a session that is stored in your database).
// If an incoming cookie is not valid, what do you think you should do with that session and cookie?
