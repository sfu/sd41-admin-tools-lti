import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@instructure/ui-alerts';
import { Button } from '@instructure/ui-buttons';
import { View } from '@instructure/ui-view';

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
