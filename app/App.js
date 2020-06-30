import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import '@instructure/canvas-theme';
import { Heading, View } from '@instructure/ui';
import stateMachine from './stateMachines/userUploadForm';
import UploadForm from './UploadForm';
import UserReviewTable from './UserReviewTable';

const App = () => {
  const [current, send] = useMachine(stateMachine, { devTools: true });
  const [uploadedData, setUploadedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  let view;
  console.log(current.value);
  switch (current.value) {
    case 'ready':
      view = (
        <UploadForm
          send={send}
          setUploadedData={setUploadedData}
          setErrorMessage={setErrorMessage}
        />
      );

      break;

    case 'reviewing':
      view = (
        <UserReviewTable
          setUploadedData={setUploadedData}
          setErrorMessage={setErrorMessage}
          send={send}
          data={uploadedData}
        />
      );
      break;

    case 'uploading':
      view = <p>Sending data to Canvas</p>;
      window.setTimeout(() => {
        send('UPLOADED');
      }, 5000);
      break;

    case 'waiting':
      view = <p>Waiting for Canvas to process data</p>;
      window.setTimeout(() => {
        send('COMPLETED');
      }, 5000);
      break;

    case 'complete':
      view = <p>All done</p>;
      break;

    case 'error':
      view = <p>Error: {errorMessage}</p>;
      break;

    default:
      view = (
        <p>
          TODO: implement handler for <code>{current.value}</code>
        </p>
      );
  }

  return (
    <View>
      <Heading level="h1" margin="medium 0">
        SD 41 Admin Tools
      </Heading>
      {view}
    </View>
  );
};

export default App;
