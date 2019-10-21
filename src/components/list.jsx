import { Row, Table, Button } from 'antd';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
  onDownloadClick = (stream) => {
    console.log(stream);
  };

  expandedRowRender = (row) => {
    const childColumns = [
      { title: '大小', dataIndex: 'size' },
      { title: '清晰度', dataIndex: 'quality' },
      {
        title: '操作',
        dataIndex: '',
        key: 'x',
        render: () => (
          <Button
            type="primary"
            icon="download"
            size="small"
            onClick={this.onDownloadClick}
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

  render() {
    const { loading, list } = this.props;
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
