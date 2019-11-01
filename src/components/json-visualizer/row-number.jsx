import React from 'react';

const RowNumber = ({ number = 231 }) => {
  const rowNumberItems = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < number; i++) {
    rowNumberItems.push(<div key={`row${i}`} className="row-number-item">{i + 1}</div>);
  }

  return rowNumberItems;
};

export default RowNumber;
