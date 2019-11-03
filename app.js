const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const CONFIG = require('./build/config');

const isDev = process.env.NODE_ENV === 'development';
const app = express();

const webpackConfig = require('./build/webpack.dev.config');

const compiler = webpack(webpackConfig);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

if (isDev) {
  // 用 webpack-dev-middleware 启动 webpack 编译
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
  }));

  // 使用 webpack-hot-middleware 支持热更新
  app.use(webpackHotMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    noInfo: true,
  }));

  // 指定开发环境下的静态资源目录
  // app.use(webpackConfig.output.publicPath, express.static(path.join(__dirname, './src')));
} else {
  app.use(webpackConfig.output.publicPath, express.static(path.join(__dirname, `./${CONFIG.DIR.DIST}`)));
  app.set('views', path.join(__dirname, `./${CONFIG.DIR.DIST}/${CONFIG.DIR.VIEW}`));
  // eslint-disable-next-line global-require
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
}

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
