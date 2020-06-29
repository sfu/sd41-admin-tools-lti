import { Machine } from 'xstate';

export default Machine({
  initial: 'READY',
  states: {
    READY: {
      on: { verified: 'REVIEWING', error: 'ERROR' },
    },
    REVIEWING: {
      on: { upload: 'UPLOADING' },
    },
    UPLOADING: {
      on: { uploaded: 'WAITING' },
    },
    WAITING: {
      on: {
        in_progress: 'WAITING',
        completed: 'COMPLETE',
        error: 'ERROR',
      },
    },
    COMPLETE: {
      type: 'final',
    },
    ERROR: {
      on: {
        reset: 'READY',
      },
    },
  },
});
