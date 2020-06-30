import { Machine } from 'xstate';

export default Machine({
  initial: 'ready',
  states: {
    ready: {
      on: { VERIFIED: 'reviewing', ERROR: 'error' },
    },
    reviewing: {
      on: { UPLOAD: 'uploading' },
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
});
