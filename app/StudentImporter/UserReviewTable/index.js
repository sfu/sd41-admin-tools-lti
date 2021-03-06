import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@instructure/ui-buttons';
import { Heading } from '@instructure/ui-heading';
import { Table } from '@instructure/ui-table';
import { View } from '@instructure/ui-view';

const UserReviewTable = ({ send, state }) => {
  const data = state.context.userSubmittedData;

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
    <View>
      <Heading level="h2">Review Data to Import</Heading>
      <Table
        caption="Review Uploaded Users"
        layout="auto"
        hover={true}
        margin="medium none"
      >
        <Table.Head>
          <Table.Row>{tableHeaderCols}</Table.Row>
        </Table.Head>
        <Table.Body>{tableBodyRows}</Table.Body>
      </Table>
      <View display="block">
        <Button
          margin="small"
          onClick={() => {
            send('RESET');
          }}
        >
          Reset
        </Button>
        <Button
          margin="small"
          color="primary"
          onClick={() => {
            send('UPLOAD');
          }}
        >
          Upload
        </Button>
      </View>
    </View>
  );
};

UserReviewTable.propTypes = {
  state: PropTypes.object.isRequired,
  send: PropTypes.func.isRequired,
};

export default UserReviewTable;
