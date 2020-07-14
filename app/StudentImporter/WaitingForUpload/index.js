import React from 'react';
import { Spinner } from '@instructure/ui-spinner';
import { Text } from '@instructure/ui-text';
import { View } from '@instructure/ui-view';

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
