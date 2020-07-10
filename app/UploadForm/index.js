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
      const ajv = new Ajv({ verbose: false, allErrors: true, messages: true });
      const validate = ajv.compile(schema);

      const content = await file.text();
      let parsed;
      try {
        parsed = csvParse(content, {
          columns: true,
          skip_lines_with_empty_values: true,
        });
      } catch (error) {
        send('CSV_PARSE_ERROR', { csvParseError: error.message });
      }

      const valid = validate(parsed);

      if (valid) {
        send('VERIFIED', { userSubmittedData: parsed });
      } else {
        send('VALIDATION_ERROR', {
          validationError: validate.errors,
        });
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
