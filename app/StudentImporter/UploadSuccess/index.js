import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, View } from '@instructure/ui';

const UploadSuccess = ({ importResult, send }) => (
  <View>
    <Alert variant="success" margin="small none">
      Your import was successful. Users imported:{' '}
      {importResult.data.counts.users}
    </Alert>
    <View display="block" margin="medium none">
      <Button
        onClick={() => {
          send('RESET');
        }}
      >
        Perform Another Import
      </Button>
    </View>
  </View>
);

UploadSuccess.propTypes = {
  importResult: PropTypes.object.isRequired,
  send: PropTypes.func.isRequired,
};

export default UploadSuccess;
