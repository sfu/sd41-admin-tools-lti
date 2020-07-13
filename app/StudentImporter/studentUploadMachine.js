import { Machine, assign } from 'xstate';
import postUserSisData from '../lib/postUserSisData';
import checkSisImportProgress from '../lib/checkSisImportProgress';

const initialContext = {
  error: null,
  validationError: null,
  csvParseError: null,
  userSubmittedData: null,
  sisImportObject: null,
  sisImportStatusObject: null,
};

export default Machine(
  {
    id: 'USER_UPLOAD_FORM',
    initial: 'ready',
    context: {
      ...initialContext,
    },
    states: {
      ready: {
        on: {
          VERIFIED: {
            target: 'reviewing',
            actions: ['SET_USER_SUBMITTED_DATA'],
          },
          CSV_PARSE_ERROR: {
            target: 'csvParseError',
            actions: assign({
              csvParseError: (_, event) => event.csvParseError,
            }),
          },
          VALIDATION_ERROR: {
            target: 'validationError',
            actions: assign({
              validationError: (_, event) => event.validationError,
            }),
          },
        },
      },

      // after file has been uploaded, parsed, and verified
      // displays review table
      reviewing: {
        on: {
          UPLOAD: 'uploading',
          RESET: {
            target: 'ready',
            actions: ['RESET'],
          },
        },
      },

      // uploads JSON to our server, which parses, verifies, and transforms
      // to CSV, and uploads to Canvas SIS import API
      uploading: {
        invoke: {
          id: 'invoke-postUserSisData',
          src: postUserSisData,
          onDone: {
            target: 'polling',
            actions: assign({ sisImportObject: (_, event) => event.data }),
          },
          onError: [
            {
              target: 'validationError',
              cond: (_, event) => event.data.error === 'VALIDATION_ERROR',
              actions: assign({
                validationError: (_, event) => event.data.errorDetail,
              }),
            },
            {
              target: 'serverError',
              cond: (_, event) => event.data.error === 'SERVER_ERROR',
            },
          ],
        },
        on: { ERROR: 'error' },
      },

      // checks the status of the import
      polling: {
        invoke: {
          id: 'invoke-checkSisImportProgress',
          src: checkSisImportProgress,
          onDone: [
            {
              target: 'complete',
              cond: (_, event) => {
                const SUCCESS_STATES = [
                  'imported',
                  'imported_with_messages',
                  'restored',
                ];
                const { workflow_state } = event.data;
                return SUCCESS_STATES.includes(workflow_state);
              },
              actions: assign({
                sisImportStatusObject: (_, event) => event.data,
              }),
            },
            {
              target: 'error',
              cond: (_, event) => {
                const ERROR_STATES = ['failed_with_messages', 'failed'];
                return ERROR_STATES.includes(event.data.workflow_state);
              },
            },
            { target: 'waiting' },
          ],
          onError: 'error',
        },
      },

      // polls for updates if import not complete
      waiting: {
        after: { 1000: 'polling' },
      },

      // we're done
      complete: {
        on: {
          RESET: 'ready',
        },
      },

      // error states
      csvParseError: {
        on: {
          RESET: 'ready',
        },
      },

      validationError: {
        on: {
          RESET: 'ready',
        },
      },

      serverError: {
        on: {
          RESET: 'ready',
        },
      },

      error: {
        on: {
          RESET: 'ready',
        },
      },
    },
  },
  {
    actions: {
      RESET: assign(() => ({
        ...initialContext,
      })),
      SET_ERROR: assign((context, event) => ({
        error: event.error,
        userSubmittedData: null,
      })),
      SET_VALIDATION_ERROR: assign((context, event) => ({
        error: event.error,
        userSubmittedData: null,
      })),
      SET_USER_SUBMITTED_DATA: assign((context, event) => ({
        userSubmittedData: event.userSubmittedData,
        error: null,
      })),
    },
  }
);
