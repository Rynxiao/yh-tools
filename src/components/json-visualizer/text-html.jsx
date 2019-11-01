import PropTypes from 'prop-types';
import React from 'react';

const TextHtml = ({ jsonObject, keyIndex, name }) => (
  <span className={name} key={`original${keyIndex}`}>{jsonObject}</span>
);

TextHtml.propTypes = {
  jsonObject: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.string.isRequired,
    PropTypes.bool.isRequired,
  ]).isRequired,
  keyIndex: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.string.isRequired,
  ]).isRequired,
  name: PropTypes.string.isRequired,
};

export default TextHtml;
