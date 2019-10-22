import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  Col, Layout, Row, message,
} from 'antd';
import './index.less';
import { trim } from './utils';
import http from './api/http';
import Input from './components/input';
import List from './components/list';

const { Header, Content } = Layout;

class App extends Component {
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
      <div className="app">
        <Layout>
          <Header className="header"><h2>Annie Downloader</h2></Header>
          <Content className="content pd-50">
            <Row>
              <Col span={3} />
              <Col span={18}>
                <Input onSearch={this.onSearch} />
                <List loading={loading} list={list} />
              </Col>
              <Col span={3} />
            </Row>
          </Content>
        </Layout>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector('#app'));
