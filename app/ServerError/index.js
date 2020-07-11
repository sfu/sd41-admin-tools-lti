import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, View } from '@instructure/ui';

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
