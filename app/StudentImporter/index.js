import React from 'react';
import { useMachine } from '@xstate/react';
import { Button, View } from '@instructure/ui';
import stateMachine from './studentUploadMachine';
import UploadForm from './UploadForm';
import UserReviewTable from './UserReviewTable';
import ValidationError from './ValidationError';
import CSVParseError from './CSVParseError';
import WaitingForUpload from './WaitingForUpload';
import UploadSuccess from './UploadSuccess';
import ServerError from './ServerError';

const App = () => {
  const [state, send] = useMachine(stateMachine, { devTools: true });
  let view;
  switch (state.value) {
    case 'ready':
      view = <UploadForm state={state} send={send} />;

      break;

    case 'reviewing':
      view = <UserReviewTable state={state} send={send} />;
      break;

    case 'uploading':
    case 'waiting':
    case 'polling':
      view = <WaitingForUpload />;
      break;

    case 'complete':
      view = (
        <UploadSuccess
          importResult={state.context.sisImportStatusObject}
          send={send}
        />
      );
      break;

    case 'validationError':
      view = (
        <ValidationError
          send={send}
          errorData={state.context.validationError}
        />
      );
      break;

    case 'csvParseError':
      view = (
        <CSVParseError send={send} errorData={state.context.csvParseError} />
      );
      break;

    case 'serverError':
      view = <ServerError send={send} />;

    case 'error':
      view = (
        <>
          <p>Error: {state.context.error}</p>
          <Button
            onClick={() => {
              send('RESET');
            }}
          >
            Reset
          </Button>
        </>
      );
      break;
  }

  return <View>{view}</View>;
};

export default App;
