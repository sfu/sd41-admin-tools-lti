import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@instructure/ui-buttons';
import { FileDrop } from '@instructure/ui-file-drop';
import { Heading } from '@instructure/ui-heading';
import IconDownloadLine from '@instructure/ui-icons/es/IconDownloadLine';
import IconUploadLine from '@instructure/ui-icons/es/IconUploadLine';
// import { IconDownloadLine, IconUploadLine } from '@instructure/ui-icons';
import { Text } from '@instructure/ui-text';
import { View } from '@instructure/ui-view';
import csvParse from 'csv-parse/lib/sync';
import Ajv from 'ajv';
import schema from '../../../sisUserSchema.json';

const downloadTemplateCsv = (e) => {
  e.preventDefault();
  const csv = 'user_id,login_id,first_name,last_name,email,status\n\n';
  const url = URL.createObjectURL(
    new Blob([csv], { type: 'application/octet-stream' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'users.csv');
  document.body.appendChild(link);
  link.click();
};

const UploadForm = ({ state, send }) => (
  <View>
    <Heading level="h2" margin="medium 0">
      Import Students to Canvas
    </Heading>

    <Text>
      Import users into Canvas by creating a <code>users.csv</code> and
      uploading it using the form below. All fields in the file are required,
      and certain fields must conform to the following specifications:
    </Text>
    <ul>
      <li>
        <code>user_id</code>: The numeric SD41 pupil number
      </li>
      <li>
        <code>login_id, email</code>: The student&apos;s SD41 email address
        (e.g. 123456@edu.burnabyschools.ca)
      </li>
      <li>
        <code>status</code>: one of <code>active</code> or <code>deleted</code>
      </li>
    </ul>
    <Button renderIcon={IconDownloadLine} onClick={downloadTemplateCsv}>
      Download template CSV file
    </Button>
    <FileDrop
      margin="small none"
      accept="text/csv"
      onDropAccepted={async ([file]) => {
        const ajv = new Ajv({
          verbose: false,
          allErrors: true,
          messages: true,
        });
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
  </View>
);

UploadForm.propTypes = {
  state: PropTypes.object.isRequired,
  send: PropTypes.func.isRequired,
};

export default UploadForm;
