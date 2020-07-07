import { Machine, assign } from 'xstate';

const initialContext = {
  error: null,
  userSubmittedData: null,
};

// TODO: Move this to its own file
const postUserSisData = (context, event) => {
  // get some data off of context
  const { userSubmittedData } = context;

  // return a promise
  return fetch(`/userSisImport`, {
    method: 'post',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userSubmittedData),
  }).then((response) => response.json());
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
        },
        on: { UPLOADED: 'waiting', ERROR: 'error' },
      },
      waiting: {
        on: {
          IN_PROGRESS: 'waiting',
          COMPLETED: 'complete',
          ERROR: 'error',
        },
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
