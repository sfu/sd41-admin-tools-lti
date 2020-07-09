import React from 'react';
import PropTypes from 'prop-types';
import { FileDrop, Heading, IconUploadLine, Text, View } from '@instructure/ui';
import csvParse from 'csv-parse/lib/sync';
import Ajv from 'ajv';
import schema from '../../sisUserSchema.json';

const UploadForm = ({ state, send }) => (
  <FileDrop
    accept="text/csv"
    onDropAccepted={async ([file]) => {
      const ajv = new Ajv({ verbose: true });
      const validate = ajv.compile(schema);

      const content = await file.text();
      try {
        const parsed = csvParse(content, {
          columns: true,
          skip_lines_with_empty_values: true,
        });

        const valid = validate(parsed);

        if (valid) {
          send('VERIFIED', { userSubmittedData: parsed });
        } else {
          send('ERROR', {
            error:
              'The data contained in the CSV file is invalid. Please check your file and try again.',
          });
        }
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
