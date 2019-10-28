import { Layout, Menu } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link, Redirect,
} from 'react-router-dom';
import Annie from './pages/annie';
import JsonVisualizer from './pages/json-visualizer';
import NoMatch from './pages/no-match';
import './app.less';

const { Header, Content } = Layout;

const App = () => (
  <Router>
    <div className="app">
      <Layout>
        <Header>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item key="1"><Link to="/">Json Visualizer</Link></Menu.Item>
            <Menu.Item key="2"><Link to="/annie-downloader">Annie Downloader</Link></Menu.Item>
          </Menu>
        </Header>
        <Content className="content pd-50">
          <Switch>
            <Route exact path="/">
              <JsonVisualizer />
            </Route>
            <Route path="/annie-downloader">
              <Annie />
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
