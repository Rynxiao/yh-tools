import { Icon } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import {
  ARRAY, classNames, ICON_COLLAPSE, ICON_EXPAND,
} from './constants';

const CollapseAndExpand = ({ type, keyIndex, expandOrCollapse }) => (
  <span className={classNames[`JSON_${type}_WRAPPER`]} key={`${type}${keyIndex}`}>
    <span className={ICON_EXPAND}>
      <Icon onClick={(event) => expandOrCollapse(event, type)} type="minus" />
    </span>
    <span className={ICON_COLLAPSE}>
      <Icon onClick={(event) => expandOrCollapse(event, type)} type="plus" />
    </span>
    <span className={classNames[`JSON_${type}_COLLAPSE`]}>{ type === ARRAY ? 'Array' : 'Object' }</span>
    <span>{ type === ARRAY ? '[' : '{' }</span>
    <span className={classNames[`JSON_${type}_ELLIPSE`]}>...</span>
  </span>
);

CollapseAndExpand.propTypes = {
  expandOrCollapse: PropTypes.func.isRequired,
  keyIndex: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
};

export default CollapseAndExpand;
