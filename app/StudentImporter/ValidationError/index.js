import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, ToggleDetails, View } from '@instructure/ui';

const ValidationError = ({ errorData, send }) => {
  return (
    <View>
      <Alert margin="small none" variant="error">
        Some of the data you provided is invalid. Please review the problems
        found below, correct your CSV file, and try again.
      </Alert>
      <ToggleDetails summary="Click to view error details">
        <pre>{JSON.stringify(errorData, null, 2)}</pre>
      </ToggleDetails>
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

ValidationError.propTypes = {
  errorData: PropTypes.object.isRequired,
  send: PropTypes.func.isRequired,
};

export default ValidationError;
