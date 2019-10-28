import React from 'react';
import PropTypes from 'prop-types';
import { Input, Row } from 'antd';

const { Search } = Input;

const SearchInput = ({ onSearch }) => (
  <Row align="middle" justify="center">
    <Search
      placeholder="输入视频网址"
      size="large"
      onSearch={(value) => onSearch(value)}
      enterButton
    />
  </Row>
);

SearchInput.propTypes = {
  onSearch: PropTypes.func.isRequired,
};
export default SearchInput;
