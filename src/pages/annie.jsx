import React, { Component } from 'react';
import {
  Col, Row, message,
} from 'antd';
import Lazyload from '../components/lazyload';
import { trim } from '../utils/annie-video';
import http from '../api/http';
import Input from '../components/annie/input';
import List from '../components/annie/list';

class Annie extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      list: [],
    };
  }

  showError = (msg) => {
    const errorArr = msg.split(':');
    const error = trim(errorArr[errorArr.length - 1]);
    message.error(error);
  };

  onSearch = (searchValue) => {
    this.setState({ loading: true });
    http.get('list', { request_url: searchValue }).then((res) => {
      this.setState({ loading: false });
      const { data } = res;
      if (data.code !== 200) {
        this.showError(data.msg);
      } else {
        this.setState({ list: data.data.list });
      }
    }, (errorMsg) => {
      this.setState({ loading: false });
      this.showError(errorMsg);
    });
  };

  render() {
    const { loading, list } = this.state;
    return (
      <Row className="pd-50">
        <Col span={3} />
        <Col span={18}>
          <Input onSearch={this.onSearch} />
          <List loading={loading} list={list} />
        </Col>
        <Col span={3} />
      </Row>
    );
  }
}

export default Annie;
