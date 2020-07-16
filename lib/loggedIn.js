const path = require('path');
const loggedIn = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.format({
      'text/plain': () => {
        res.status(401).send('Unauthorized');
      },
      'text/html': () => {
        res.status(401).sendFile(path.resolve('./views/401.html'));
      },
      'application/json': () => {
        res.status(401).send({ error: 'UNAUTHORIZED' });
      },
    });
  }
};

module.exports = loggedIn;
