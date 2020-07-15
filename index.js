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
const Ajv = require('ajv');
const Sentry = require('@sentry/node');
const loggedIn = require('./lib/loggedIn');

const sisUserSchema = require('./sisUserSchema.json');

const { NODE_ENV, SESSION_SECRET, SENTRY_DSN } = process.env;

const entry = path.resolve('./app/index.html');

let bundle;
if (NODE_ENV !== 'production') {
  bundle = new Bundler(entry, {
    hmr: true,
    hmrPort: 8000,
    https: {
      cert: './.certs/sd41lti.lcs-dev.its.sfu.ca/cert.pem',
      key: './.certs/sd41lti.lcs-dev.its.sfu.ca/key.pem',
    },
  });
}

const sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
};

const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

const app = express();

if (SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN });
  app.use(Sentry.Handlers.requestHandler());
}

app.use(session(sessionConfig));
app.set('trust proxy', true);
app.use(compression());
if (NODE_ENV === 'production') {
  app.use('/dist', express.static('dist'));
}
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

// all routes beyond this point require a session
app.use(loggedIn);

app.post('/userSisImport', jsonParser, async (req, res) => {
  try {
    const { body } = req;
    // validate the incoming data against the schema
    const ajv = new Ajv({ verbose: true });
    const validate = ajv.compile(sisUserSchema);

    const valid = validate(body);

    if (!valid) {
      res.send(400, {
        error: 'VALIDATION_ERROR',
        errorDetail: validate.errors,
      });
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
        user_id: `SD41:::${record.user_id}`,
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
    res.send(500, { error: 'SERVER_ERROR', data: res.sentry });
  }
});

app.get('/sisImportStatus/:id', async (req, res) => {
  const { id } = req.params;
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

if (NODE_ENV !== 'production') {
  app.use(bundle.middleware());
}

app.get('*', (req, res) => {
  res.sendFile(path.resolve('./dist/index.html'));
});

if (SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.send(500, { error: 'SERVER_ERROR', data: res.sentry });
});

app.listen(3000, () => {
  console.log('ready');
});
