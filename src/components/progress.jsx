import {
  Col, Icon, Progress, Row,
} from 'antd';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './styles/progress.less';

const getStatus = (progress, status) => {
  if (status === 'exception') {
    return 'exception';
  }

  if (progress === 100) {
    return 'success';
  }

  return 'active';
};

const CloseBtn = ({ setClose, onClose }) => (
  <Icon
    type="close-circle"
    className="btn close-btn"
    theme="filled"
    onClick={() => {
      setClose(false);
      onClose();
    }}
  />
);

const RedoBtn = ({ setClose, onRefresh }) => (
  <Icon
    type="redo"
    className="btn refresh-btn"
    onClick={() => {
      setClose(true);
      onRefresh();
    }}
  />
);

const ProgressBar = ({
  progress,
  status,
  filename,
  onClose,
  onRefresh,
}) => {
  const [close, setClose] = useState(true);
  const isComplete = progress === 100;
  return (
    <div className="progress-bar">
      <p>{ filename }</p>
      <Row type="flex" justify="space-around" align="middle">
        <Col span={19}><Progress percent={progress} status={getStatus(progress, status)} /></Col>
        <Col span={2}>
          { close && !isComplete ? <CloseBtn setClose={setClose} onClose={onClose} />
            : <RedoBtn setClose={setClose} onRefresh={onRefresh} /> }
        </Col>
      </Row>
    </div>
  );
};

export default ProgressBar;

ProgressBar.defaultProps = {
  status: '',
};

ProgressBar.propTypes = {
  filename: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  status: PropTypes.string,
};

CloseBtn.propTypes = {
  onClose: PropTypes.func.isRequired,
  setClose: PropTypes.func.isRequired,
};

RedoBtn.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  setClose: PropTypes.func.isRequired,
};
