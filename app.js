var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var resourceRouter = require('./routes/resource')
var apiRouter = require('./routes/api')
// var diagnosticsRouter = require('./routes/diagnostics')
// var resourceRouter = require('./routes/resource')
// const recordRouter = require('./routes/record')
// const functionRouter = require('./routes/function')
// const { WorkflowRecord } = require('./controller/record/class/index')
// const PuppeteerControl = require('./controller/puppeteer/class')
// const UI = require('./controller/ui')
const RecordManager = require('./controller/record-manager')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
let recordManager = new RecordManager(io)
app.locals.io = io

// app.locals.puppeteerControl = new PuppeteerControl()
// app.locals.workflow = new WorkflowRecord(app.locals.puppeteerControl)
// app.locals.ui = new UI(app.locals.workflow)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(function (req, res, next) {
  res.recordManager = recordManager;
  next();
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/api/function', functionRouter)
app.use('/api', apiRouter);
// app.use('/diagnostics', diagnosticsRouter);
app.use('/resource', resourceRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = { server, io, app };
