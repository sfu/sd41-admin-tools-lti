const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Provider } = require('ims-lti');
const { promisify } = require('util');

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

app.get('/', (req, res) => {
  res.send(`<pre>${JSON.stringify(req.session, null, 2)}</pre>`);
  console.log(req.session);
});

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

app.listen(3000);
