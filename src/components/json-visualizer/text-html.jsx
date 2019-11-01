import PropTypes from 'prop-types';
import React from 'react';

const TextHtml = ({ jsonObject, keyIndex, name }) => (
  <span className={name} key={`original${keyIndex}`}>{jsonObject}</span>
);

TextHtml.propTypes = {
  jsonObject: PropTypes.string.isRequired,
  keyIndex: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
};

export default TextHtml;
