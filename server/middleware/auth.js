const models = require('../models');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports.createSession = (req, res, next) => {
  req.session = {};
  if (req.cookies.hasOwnProperty('shortlyid')) {
    console.log('hit create session');
    models.Sessions.get({ hash: req.cookies['shortlyid'] }).then((session) => {
      console.log(session);
      console.log(_.isEmpty(session));

      if (session) {
        session.userId ? session.user = req.body.username : fsdjf;
      } else {

      }
    });
  } else {
    models.Sessions.create()
      .then((results) => models.Sessions.get({ id: results.insertId }))
      .then((session) => {
        req.cookies['shortlyid'] = session.hash;
        req.session.userId = session.userId;
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
