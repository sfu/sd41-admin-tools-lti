import React from 'react';
import { Heading, View } from '@instructure/ui';
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
