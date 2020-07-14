import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@instructure/ui-alerts';
import { Button } from '@instructure/ui-buttons';
import { ToggleDetails } from '@instructure/ui-toggle-details';
import { View } from '@instructure/ui-view';

const CSVParseError = ({ errorData, send }) => {
  return (
    <View>
      <Alert margin="small none" variant="error">
        The CSV file you provided could not be parsed. Please check your file
        and try again.
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

CSVParseError.propTypes = {
  errorData: PropTypes.string.isRequired,
  send: PropTypes.func.isRequired,
};

export default CSVParseError;
