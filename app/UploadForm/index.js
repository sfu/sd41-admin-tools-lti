import React from 'react';
import PropTypes from 'prop-types';
import { FileDrop, Heading, IconUploadLine, Text, View } from '@instructure/ui';
import csvParse from 'csv-parse/lib/sync';

const UploadForm = ({ state, send }) => (
  <FileDrop
    accept="text/csv"
    onDropAccepted={async ([file]) => {
      const REQUIRED_FIELDS = ['login_id', 'user_id'];
      const content = await file.text();
      try {
        const parsed = csvParse(content, {
          columns: true,
          skip_lines_with_empty_values: true,
        });

        if (
          !REQUIRED_FIELDS.every((reqField) =>
            parsed[0].hasOwnProperty(reqField)
          )
        ) {
          send('ERROR', {
            error:
              'File is missing one or more required fields. `login_id` and `user_id` are both required. Please check your file and try again.',
          });
          return;
        }

        parsed.forEach((record, i) => {
          if (!REQUIRED_FIELDS.every((reqField) => !!record[reqField])) {
            send('ERROR', {
              error: `Line ${
                i + 2
              } is missing a value for one or more required fields. Please check your file and try again.`,
            });
          }
        });

        send('VERIFIED', { userSubmittedData: parsed });
      } catch (error) {
        send('ERROR', { error: error.message });
      }
    }}
    onDropRejected={([file]) => {
      send('ERROR', { error: `File rejected ${file.name}` });
    }}
    renderLabel={({ isDragAccepted, isDragRejected }) => (
      <View as="div" padding="xx-large large" background="primary">
        <IconUploadLine size="large" />
        <Heading>Drop your users CSV file here to upload</Heading>
        <Text color="brand">
          Drag and drop, or click to browse your computer
        </Text>
      </View>
    )}
  />
);

UploadForm.propTypes = {
  state: PropTypes.object.isRequired,
  send: PropTypes.func.isRequired,
};

export default UploadForm;
