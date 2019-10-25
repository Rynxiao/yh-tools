import {
  Row, Table, Button, Drawer, Icon,
} from 'antd';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import http from '../api/http';
import { clientId, getVideoInfoByConnectionId, getVideoInfoInMap } from '../utils';
import WebSocketClient from '../utils/websocket.client';
import './styles/list.less';
import ProgressBar from './progress';

const columns = [
  {
    title: '网址',
    dataIndex: 'site',
    ellipsis: true,
  },
  {
    title: '名字',
    dataIndex: 'title',
    ellipsis: true,
  },
  { title: '类型', dataIndex: 'type' },
];

class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      progressBarMaps: {},
    };
  }

  async componentDidUpdate(prevProps) {
    const { list } = this.props;
    if (list.length !== prevProps.list.length) {
      await WebSocketClient.connect((event) => {
        const data = JSON.parse(event.data);
        if (data.event === 'close') {
          this.updateCloseStatusOfProgressBar(list, data);
        } else {
          this.generateProgressBarList(list, data);
        }
      });
    }
  }

  updateCloseStatusOfProgressBar = (list, data) => {
    const id = data.connectionId;
    this.setState((state) => {
      const progressBarItem = state.progressBarMaps[id];
      if (progressBarItem) {
        progressBarItem.status = 'exception';
        return {
          progressBarMaps: {
            ...state.progressBarMaps,
            ...{ [id]: progressBarItem },
          },
        };
      }
      return state;
    });
  };

  generateProgressBarList = (list, data) => {
    const { progress, speed, remain } = data;
    const pId = data.parent_id;
    const cId = data.child_id;
    const id = `${pId}-${cId}`;
    const videoInfo = getVideoInfoInMap(list, id);
    const progressBarItem = {
      info: videoInfo,
      progress: parseFloat(progress),
      speed,
      remain,
    };
    this.setState((state) => ({
      progressBarMaps: {
        ...state.progressBarMaps,
        ...{ [id]: progressBarItem },
      },
    }));
  };

  onDownloadClick = (stream, parentId) => {
    this.setState({ visible: true });
    const urlArr = stream.url.split(/\s+/);
    const code = urlArr[2];
    const url = urlArr[3];
    const childId = stream.id;
    http.get(
      'download',
      {
        code,
        parent_id: parentId,
        child_id: childId,
        download_url: url,
        client_id: clientId,
      },
    );
  };

  expandedRowRender = (row) => {
    const childColumns = [
      { title: '大小', dataIndex: 'size' },
      { title: '清晰度', dataIndex: 'quality' },
      {
        title: '操作',
        dataIndex: '',
        key: 'x',
        render: (stream) => (
          <Button
            type="primary"
            icon="download"
            size="small"
            onClick={() => this.onDownloadClick(stream, row.id)}
          >
            下载
          </Button>
        ),
      },
    ];
    return (
      <Table
        bordered={false}
        columns={childColumns}
        dataSource={row.stream}
        pagination={false}
      />
    );
  };

  onCloseDownloadPopup = () => {
    this.setState({ visible: false });
  };

  onToggleDownloadPopup = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  onStopDownloading = (connectionId) => {
    http.get(`close/${connectionId}/${clientId}`);
  };

  onRefresh = (connnectionId) => {
    const videoInfo = getVideoInfoByConnectionId(connnectionId);
    this.onDownloadClick(videoInfo.stream, videoInfo.parent_id);
  };

  render() {
    const { loading, list } = this.props;
    const { visible, progressBarMaps } = this.state;

    return (
      <div className="pd-t-50">
        <Row align="middle" justify="center">
          <Table
            loading={loading}
            pagination={false}
            columns={columns}
            dataSource={list}
            expandedRowRender={this.expandedRowRender}
            size="middle"
          />
        </Row>
        <Drawer
          title="下载列表"
          placement="right"
          closable
          mask={false}
          width="340"
          onClose={this.onCloseDownloadPopup}
          visible={visible}
        >
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
          <div
            className="collapse-btn"
            role="button"
            tabIndex="0"
            onClick={this.onToggleDownloadPopup}
          >
            <Icon type="unordered-list" />
          </div>
          {
            Object.keys(progressBarMaps).map((id) => {
              const {
                info, progress, status, speed, remain,
              } = progressBarMaps[id];
              return (
                <ProgressBar
                  key={id}
                  filename={info}
                  progress={progress}
                  speed={speed}
                  remain={remain}
                  status={status}
                  onClose={() => this.onStopDownloading(id)}
                  onRefresh={() => this.onRefresh(id)}
                />
              );
            })
          }
        </Drawer>
      </div>
    );
  }
}

List.propTypes = {
  loading: PropTypes.bool.isRequired,
  list: PropTypes.arrayOf(PropTypes.shape({
    site: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
    stream: PropTypes.arrayOf(PropTypes.shape({
      quality: PropTypes.string,
      size: PropTypes.string,
      url: PropTypes.string,
    })),
  })).isRequired,
};

export default List;
