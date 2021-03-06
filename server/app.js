const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');
const cookieParser = require('./middleware/cookieParser.js');
const models = require('./models');

const app = express();

// Express utilizes MVC Framework
// the Set creates different views and sends it back
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs'); // set view engine to embedded js
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser);
app.use(Auth.createSession);
app.use(express.static(path.join(__dirname, '../public')));


app.get('/', Auth.verifySession, (req, res) => {
  res.render('index');
});

app.get('/create', Auth.verifySession, (req, res) => {
  res.render('index');
});

app.get('/links', Auth.verifySession, (req, res, next) => {
  models.Links.getAll()
    .then((links) => {
      res.status(200).send(links);
    })
    .error((error) => {
      res.status(500).send(error);
    });
});

app.post('/links', (req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then((link) => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then((title) => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin,
      });
    })
    .then((results) => {
      return models.Links.get({ id: results.insertId });
    })
    .then((link) => {
      throw link;
    })
    .error((error) => {
      res.status(500).send(error);
    })
    .catch((link) => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

// "/login"
// "/signup"
app.post('/login', (req, res) => {
  let { username, password } = req.body;
  models.Users.get({ username }).then((result) => {
    if (result === undefined) {
      res.redirect('/login');
    } else {
      let isCredentialsCorrect = models.Users.compare(
        password,
        result.password,
        result.salt
      );
      if (isCredentialsCorrect) {
        models.Sessions.update({ hash: req.session.hash }, { userId: result.id })
          .then(() => res.redirect('/'));
      } else {
        res.redirect('/login');
      }
    }
  });
});
// TODO: create session

app.post('/signup', (req, res) => {
  let { username, password } = req.body;

  models.Users.checkForUser({ username })
    .then((result) => {
      return result
        ? res.status(400).redirect('/signup').json('Username is already chosen.')
        : models.Users.create({ username, password });
    })
    .then((result) => res.status(201).redirect('/').send())
    .catch((err) => res.status(400).send());
});

app.get('/logout', (req, res) => {
  models.Sessions.delete({hash: req.cookies.shortlyid})
    .then((result) => {
      res.clearCookie('shortlyid'); // does'nt matter which you do, the redirect is wahts causeing the test to pass
      // res.cookie('shortlyid', 'hi');
      res.status(200).redirect('/login').send();
      //TODO:why does th redirect make the correct impact?
    });
});

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/


app.get('/:code', (req, res, next) => {
  return models.Links.get({ code: req.params.code })
    .tap((link) => {
      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap((link) => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error((error) => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
