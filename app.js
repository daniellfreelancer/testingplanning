require('dotenv').config()
require('./config/database')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const bodyParser = require('body-parser')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const userAdmin = require('./routes/adminRoutes')
const userPlanner = require('./routes/plannerRoutes')
const userInsti = require('./routes/instiroutes')
const userSchool = require('./routes/schoolRoutes')
const userClassroom = require('./routes/classroomRoutes')
const userStudents = require('./routes/studentRoutes')
const userPlanification = require('./routes/planificationRoutes')
const userResumeClass = require('./routes/resumeVmClassRoutes')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(cors());

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/public', express.static(`${__dirname}/storage/assets`))
app.use(cookieParser());


//Express Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);




//VitalMove Routes
app.use('/admin', userAdmin)
app.use('/planner', userPlanner)
app.use('/insti', userInsti)
app.use('/school', userSchool)
app.use('/classroom', userClassroom)
app.use('/student', userStudents)
app.use('/planing', userPlanification)
app.use('/vmclass', userResumeClass)



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
