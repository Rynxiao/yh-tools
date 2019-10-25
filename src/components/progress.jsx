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

const getSpeed = (speed) => speed.replace('iB', '');
const getRemain = (remain) => remain.replace('m', '分').replace('s', '秒');

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

const getSpeedTemplate = (speed) => {
  if (+speed === 0) return null;
  return (
    <span>
      下载速度：
      <span className="speed">{getSpeed(speed)}</span>
    </span>
  );
};

const getRemainTemplate = (remain) => {
  if (+remain === 0) return null;
  return (
    <span>
      预计完成还需要：
      <span className="time">{getRemain(remain)}</span>
    </span>
  );
};

const ProgressBar = ({
  progress,
  speed,
  remain,
  status,
  filename,
  onClose,
  onRefresh,
}) => {
  const [close, setClose] = useState(true);
  const isComplete = progress === 100;
  return (
    <div className="progress-bar">
      <p>{ getSpeed(filename) }</p>
      <Row type="flex" justify="space-around" align="middle">
        <Col span={19}><Progress percent={progress} status={getStatus(progress, status)} /></Col>
        <Col span={2}>
          { close && !isComplete ? <CloseBtn setClose={setClose} onClose={onClose} />
            : <RedoBtn setClose={setClose} onRefresh={onRefresh} /> }
        </Col>
      </Row>
      <div className="extra-info">
        {getSpeedTemplate(speed)}
        {getRemainTemplate(remain)}
      </div>
    </div>
  );
};

export default ProgressBar;

ProgressBar.defaultProps = {
  status: '',
  speed: '0.00 MiB/s',
  remain: '0时0分0秒',
};

ProgressBar.propTypes = {
  filename: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  speed: PropTypes.string,
  remain: PropTypes.string,
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
