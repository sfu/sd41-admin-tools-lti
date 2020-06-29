import React from 'react';
import PropTypes from 'prop-types';
import { FileDrop, Heading, IconUploadLine, Text, View } from '@instructure/ui';
import csvParse from 'csv-parse/lib/sync';

const UploadForm = ({ send, setUploadedData, setErrorMessage }) => (
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
          send('error');
          return;
        }

        parsed.forEach((record, i) => {
          if (!REQUIRED_FIELDS.every((reqField) => !!record[reqField])) {
            setErrorMessage(
              `Line ${
                i + 2
              } is missing a value for one or more required fields. Please check your file and try again.`
            );
            console.log(record);
            send('error');
          }
        });

        setUploadedData(parsed);
        send('verified');
      } catch (error) {
        setErrorMessage(error.message);
        send('error');
      }
    }}
    onDropRejected={([file]) => {
      setErrorMessage(`File rejected ${file.name}`);
      send('error');
    }}
    renderLabel={
      <View as="div" padding="xx-large large" background="primary">
        <IconUploadLine size="large" />
        <Heading>Drop your users CSV file here to upload</Heading>
        <Text color="brand">
          Drag and drop, or click to browse your computer
        </Text>
      </View>
    }
  />
);

UploadForm.propTypes = {
  send: PropTypes.func.isRequired,
  setUploadedData: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
};

export default UploadForm;
