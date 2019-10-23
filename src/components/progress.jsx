import {
  Col, Icon, Progress, Row,
} from 'antd';
import React from 'react';
import PropTypes from 'prop-types';
import './styles/progress.less';

const ProgressBar = ({ progress, filename }) => (
  <div className="progress-bar">
    <p>{ filename }</p>
    <Row type="flex" justify="space-around" align="middle">
      <Col span={19}><Progress percent={progress} status={progress === 100 ? 'success' : 'active'} /></Col>
      <Col span={2}><Icon type="close-circle" className="close-btn" theme="filled" /></Col>
    </Row>
  </div>
);

export default ProgressBar;

ProgressBar.propTypes = {
  filename: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
};
