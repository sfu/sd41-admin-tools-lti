import React from 'react';
import PropTypes from 'prop-types';
import { Button, Heading, Table } from '@instructure/ui';

const UserReviewTable = ({ data, setUploadedData, setErrorMessage, send }) => {
  // generate the header row
  const tableHeaderCols = Object.keys(data[0]).map((field) => (
    <Table.ColHeader key={field} id={field}>
      {field}
    </Table.ColHeader>
  ));

  const tableBodyRows = data.map((row, i) => {
    const fieldNames = Object.keys(row);
    return (
      <Table.Row key={`row_${i}`}>
        {Object.values(row).map((field, i) => (
          <Table.Cell id={field} key={`${i}_${fieldNames[i]}_${field}`}>
            {field}
          </Table.Cell>
        ))}
      </Table.Row>
    );
  });

  return (
    <>
      <Heading level="h2">Review Data to Upload</Heading>
      <Table caption="Review Uploaded Users" layout="auto" hover={true}>
        <Table.Head>
          <Table.Row>{tableHeaderCols}</Table.Row>
        </Table.Head>
        <Table.Body>{tableBodyRows}</Table.Body>
      </Table>
      <Button
        onClick={() => {
          setUploadedData(null);
          setErrorMessage(null);
          send('RESET');
        }}
      >
        Reset
      </Button>
      <Button
        color="primary"
        onClick={() => {
          setUploadedData(null);
          setErrorMessage(null);
          send('UPLOAD');
        }}
      >
        Upload
      </Button>
    </>
  );
};

UserReviewTable.propTypes = {
  data: PropTypes.array.isRequired,
  setUploadedData: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  send: PropTypes.func.isRequired,
};

export default UserReviewTable;
