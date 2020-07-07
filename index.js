const crypto = require('crypto');
const { promisify } = require('util');
const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const compression = require('compression');
const { Provider } = require('ims-lti');
const Bundler = require('parcel-bundler');
const stringifyCsv = require('csv-stringify/lib/sync');
const axios = require('axios');
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

const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

const app = express();
app.use(session(sessionConfig));
app.set('trust proxy', true);
app.use(compression());

app.post('/ltiLaunch', urlencodedParser, async (req, res) => {
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

// TODO: check for session
app.post('/userSisImport', jsonParser, async (req, res) => {
  try {
    const { body } = req;
    // perform same checks as client-side
    // TODO: constrain email addresses to @edu.burnabyschools.ca
    const REQUIRED_FIELDS = ['login_id', 'user_id'];
    const reqFieldValueErrors = [];
    body.forEach((record, i) => {
      if (!REQUIRED_FIELDS.every((reqField) => !!record[reqField])) {
        reqFieldValueErrors.push(
          `Record ${i} is missing a value for one or more required fields. \`login_id\` and \`user_id\` are both required.`
        );
      }
    });

    if (reqFieldValueErrors.length > 0) {
      res.send(400, { errors: reqFieldValueErrors, dataReceived: body });
      return;
    }

    // set password to random string, even if one presented in data
    // set status to active if not present
    const randomPassword = () =>
      new Promise((resolve, reject) => {
        return crypto.randomBytes(48, (err, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer.toString('hex'));
          }
        });
      });

    const transformRecord = async (record) => {
      const password = await randomPassword();
      const status = record.hasOwnProperty('status') ? record.status : 'active';
      return {
        ...record,
        status,
        password,
      };
    };

    const transformed = await Promise.all(
      body.map((item) => transformRecord(item))
    );

    // transform data to CSV
    const csvData = stringifyCsv(transformed, { header: true });

    // create canvas SIS import
    const {
      CANVAS_HOST,
      CANVAS_TOKEN,
      CANVAS_ROOT_ACCOUNT_ID = 'default',
    } = process.env;

    const result = await axios({
      method: 'post',
      url: `${CANVAS_HOST}/api/v1/accounts/${CANVAS_ROOT_ACCOUNT_ID}/sis_imports`,
      headers: {
        'Content-Type': 'text/csv',
        Authorization: `Bearer ${CANVAS_TOKEN}`,
      },
      data: csvData,
    });

    // return the sis import response to the app
    res.send(result.data);
  } catch (error) {
    console.log(error);
    res.send(500, { errors: [error.message] });
  }
});

// TODO: check for session
app.get('/sisImportStatus/:id', async (req, res) => {
  const { id } = req.params;
  console.log({ id });
  const {
    CANVAS_HOST,
    CANVAS_TOKEN,
    CANVAS_ROOT_ACCOUNT_ID = 'default',
  } = process.env;

  try {
    const result = await axios({
      method: 'get',
      url: `${CANVAS_HOST}/api/v1/accounts/${CANVAS_ROOT_ACCOUNT_ID}/sis_imports/${id}`,
      headers: {
        Authorization: `Bearer ${CANVAS_TOKEN}`,
      },
    });
    res.send(result.data);
  } catch (error) {
    console.log(error);
    res.send(500, { errors: [error.message] });
  }
});

app.use(bundle.middleware());

// TODO: check for session
app.get('*', (req, res) => {
  res.sendFile(path.resolve('./dist/index.html'));
});

app.listen(3000, () => {
  console.log('ready');
});
