import { Machine, assign } from 'xstate';
import postUserSisData from '../lib/postUserSisData';
import checkSisImportProgress from '../lib/checkSisImportProgress';

const initialContext = {
  error: null,
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
          ERROR: {
            target: 'error',
            actions: ['SET_ERROR'],
          },
        },
      },
      reviewing: {
        on: {
          UPLOAD: 'uploading',
          RESET: {
            target: 'ready',
            actions: ['RESET'],
          },
        },
      },
      uploading: {
        invoke: {
          id: 'invoke-postUserSisData',
          src: postUserSisData,
          onDone: {
            target: 'polling',
            actions: assign({ sisImportObject: (_, event) => event.data }),
          },
          onError: 'error',
        },
        on: { ERROR: 'error' },
      },
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
                console.log({ workflow_state });
                console.log(event.data);
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
      waiting: {
        after: { 1000: 'polling' },
      },
      complete: {
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
      SET_USER_SUBMITTED_DATA: assign((context, event) => ({
        userSubmittedData: event.userSubmittedData,
        error: null,
      })),
    },
  }
);
