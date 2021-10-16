const parseCookies = (req, res, next) => {
  let cookies = req.headers.cookie;
  let cookieTray = (cookies) ? cookies.split('; ') : [];

  let scone = {};
  for (let cookie of cookieTray) {
    let index = cookie.indexOf('=');
    let chocolateChip = cookie.slice(0, index);
    let semiSweetChocolate = cookie.slice(index + 1);
    scone[chocolateChip] = semiSweetChocolate;
  }
  req.cookies = scone;

  next();
};

module.exports = parseCookies;