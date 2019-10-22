import {
  Row, Table, Button, Drawer, Icon,
} from 'antd';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import http from '../api/http';
import { clientId } from '../utils';
import WebSocketClient from '../utils/websocket.client';
import './styles/list.less';

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
      visible: true,
    };
  }

  async componentDidMount() {
    await WebSocketClient.connect((event) => {
      console.log(`[message] Data received from server: ${event.data}`);
    });
  }

  onDownloadClick = (stream, parentId) => {
    this.setState({ visible: true });
    console.log(stream);
    console.log(parentId);
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
    console.log(row);
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

  render() {
    const { loading, list } = this.props;
    const { visible } = this.state;

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
            onClick={this.onCloseDownloadPopup}
          >
            <Icon type="unordered-list" />
          </div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
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
