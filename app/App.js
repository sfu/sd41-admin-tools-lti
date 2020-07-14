import React from 'react';
import { Heading } from '@instructure/ui-heading';
import { View } from '@instructure/ui-view';
import StudentImporter from './StudentImporter';
import '@instructure/canvas-theme';

const App = () => {
  return (
    <View>
      <Heading level="h1" margin="medium 0">
        SD 41 Admin Tools
      </Heading>
      <StudentImporter />
    </View>
  );
};

export default App;
