const { Sessions } = require('../models');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports.createSession = (req, res, next) => {
  req.session = {};
  console.log('req cookie');
  console.log('hit1');
  Promise.resolve(req.cookies.shortlyid)
    .then((hash) => {
      console.log('hit2');
      if (!hash) {
        throw null;
      } else {
        return Session.get({ hash: req.cookies.shortlyid });
      }
    })
    .then((session) => {
      console.log('hit3');
      if (session == null) {
        throw Error('null');
      } else {
        Object.assign(req.session, session);
      }
    })
    .catch((err) => {
      console.log('hit4');
      Sessions.create()
        .then((results) => Sessions.get({ id: results.insertId }))
        .then((session) => {
          req.cookies['shortlyid'] = session.hash;
          req.session.hash = session.hash;
          console.log(req.session);
          res.cookies.shortlyid = session.hash;
        });
    })
    .then(() => next());
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

// In middleware/auth.js, write a createSession middleware function that accesses the parsed cookies on the request, looks up the user data related to that session, and assigns an object to a session property on the request that contains relevant user information. (Ask yourself: what information about the user would you want to keep in this session object?)
// Things to keep in mind:
// An incoming request with no cookies should generate a session with a unique hash and store it the sessions database. The middleware function should use this unique hash to set a cookie in the response headers. (Ask yourself: How do I set cookies using Express?).
// If an incoming request has a cookie, the middleware should verify that the cookie is valid (i.e., it is a session that is stored in your database).
// If an incoming cookie is not valid, what do you think you should do with that session and cookie?
