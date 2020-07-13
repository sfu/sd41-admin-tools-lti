import React from 'react';
import { Spinner, Text, View } from '@instructure/ui';

const WaitingForUload = () => {
  return (
    <View>
      <Spinner renderTitle="Waiting for Canvas to process the import" />
      <Text>Waiting for Canvas to process the import&hellip;</Text>
    </View>
  );
};

WaitingForUload.propTypes = {};

export default WaitingForUload;
