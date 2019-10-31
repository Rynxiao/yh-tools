import { Layout, Menu } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import NoMatch from './pages/no-match';
import LazyLoad from './components/lazyload';
import './app.less';

const { Header, Content } = Layout;

const App = () => (
  <Router>
    <div className="app">
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item key="1"><Link to="/">Json可视化</Link></Menu.Item>
            <Menu.Item key="2"><Link to="/annie-downloader">Annie下载器</Link></Menu.Item>
          </Menu>
        </Header>
        <Content className="content">
          <Switch>
            <Route exact path="/">
              <LazyLoad path="json-visualizer" />
            </Route>
            <Route path="/annie-downloader">
              <LazyLoad path="annie" />
            </Route>
            <Route path="*">
              <NoMatch />
            </Route>
          </Switch>
        </Content>
      </Layout>
    </div>
  </Router>
);

ReactDOM.render(<App />, document.querySelector('#app'));
