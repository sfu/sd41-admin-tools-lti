import { Machine, assign } from 'xstate';

const initialContext = {
  error: null,
  userSubmittedData: null,
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
        type: 'final',
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
