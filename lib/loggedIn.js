const loggedIn = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.send(401, { error: 'UNAUTHORIZED' });
  }
};

module.exports = loggedIn;
