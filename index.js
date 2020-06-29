const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const compression = require('compression');
const { Provider } = require('ims-lti');
const { promisify } = require('util');

const Bundler = require('parcel-bundler');
const path = require('path');
const entry = path.resolve('./app/index.html');
const bundle = new Bundler(entry, {
  hmr: true,
  hmrPort: 8000,
  https: {
    cert: './.certs/sd41lti.lcs-dev.its.sfu.ca/cert.pem',
    key: './.certs/sd41lti.lcs-dev.its.sfu.ca/key.pem',
  },
});

// TODO: use redis for sessions
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
};

const app = express();
app.use(session(sessionConfig));
app.set('trust proxy', true);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

app.post('/', async (req, res) => {
  const {
    LTI_CLIENT_ID,
    LTI_CLIENT_SECRET,
    CANVAS_SUBACCOUNT_ID,
  } = process.env;

  const CANVAS_ADMIN_ROLE = 'urn:lti:instrole:ims/lis/Administrator';
  const provider = new Provider(LTI_CLIENT_ID, LTI_CLIENT_SECRET);
  const validateLtiLaunch = promisify(provider.valid_request);

  const { custom_canvas_account_id, roles } = req.body;

  // first validate the launch
  try {
    await validateLtiLaunch(req, req.body);
  } catch (error) {
    // TODO: Log to sentry
    req.session.loggedIn = false;
    req.session.errorCode = 'ERROR_INVALID_LAUNCH';
    res.redirect('/');
  }

  // next, check if we're in the right subaccount ahd have the right privs
  const isAuthorized =
    custom_canvas_account_id === CANVAS_SUBACCOUNT_ID &&
    roles.split(',').includes(CANVAS_ADMIN_ROLE);

  if (!isAuthorized) {
    req.session.errorCode = 'ERR_UNAUTHORIZED';
  }
  req.session.loggedIn = isAuthorized;

  res.redirect('/');
});

app.use(bundle.middleware());
app.get('*', (req, res) => {
  res.sendFile(path.resolve('./dist/index.html'));
});

app.listen(3000, () => {
  console.log('ready');
});
