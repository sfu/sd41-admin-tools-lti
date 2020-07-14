import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@instructure/ui-alerts';
import { Button } from '@instructure/ui-buttons';
import { View } from '@instructure/ui-view';

const ServerErrror = ({ send }) => {
  return (
    <View>
      <Alert margin="small none" variant="error">
        A server error occurred. This error has been reported.
      </Alert>
      <Button
        margin="small none"
        onClick={() => {
          send('RESET');
        }}
      >
        Try Again
      </Button>
    </View>
  );
};

ServerErrror.propTypes = {
  send: PropTypes.func.isRequired,
};

export default ServerErrror;
