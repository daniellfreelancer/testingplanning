require('dotenv').config()
require('./config/database')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const bodyParser = require('body-parser')
const transbankRoutes = require('./routes/transbank.routes');

const fileUpload = require('express-fileupload')
// const { initializeApp } = require("firebase-admin/app");

// initializeApp();


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
const userPrograms = require('./routes/programRoutes')
const userWorkshops = require('./routes/workshopRoutes')
const userWorkshopPlanifications = require('./routes/workshopPlanificationRoutes')
const userTasks = require('./routes/taskRoutes')
const userGradebook = require('./routes/gradebookRoutes')
const userMoments = require('./routes/momentRoutes')
const userFeeds = require('./routes/postRoutes')
const userNotifications = require('./routes/tokenRoutes')
const userNotificationsApp = require('./routes/notificationRoutes')
const userSurvey = require('./routes/surveyRoutes')
const userFitData = require('./routes/fitData.routes')
const userArduino = require('./routes/arduino.routes')
const userWorkshopReport = require('./routes/workshopReport.routes')
const userDusunSmartwatch = require('./routes/dusunSM.routes')
const chileafDevices = require('./routes/vmDevices.routes')
const chileafStocks = require('./routes/chileafStock.routes')
const medicalRegistert = require('./routes/medicalRegister.routes')
const requerimentRegister = require('./routes/requeriments.routes')
const hrvRegister = require('./routes/hrv.routes');
const sportClub = require('./routes/clubes.routes');
const sportCategory = require('./routes/sportCategories.routes');
const membershipFutbol = require('./routes/membershipFutbol.routes')
const trainingApp = require('./routes/trainingApp.routes')
const institutionDecentralized = require('./routes/institutionDecentralized.routes')
const sportPlanner = require('./routes/sportPlanification.routes')
const vmTrainingResume = require('./routes/resumeVMTraining.routes')
const fcm = require('./routes/fcm.routes')
const car = require('./routes/appoiment.routes')
const userGym = require('./api/gym/routes/gymUser.routes')
const gym = require('./api/gym/routes/gym.routes')

const rekoAWS = require('./routes/awsRekonitionRoutes')


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

// app.use(fileUpload({
//   useTempFiles : true,
//   tempFileDir : './files'
// }));

//VitalMove Routes
app.use('/admin', userAdmin)
app.use('/planner', userPlanner)
app.use('/insti', userInsti)
app.use('/school', userSchool)
app.use('/classroom', userClassroom)
app.use('/student', userStudents)
app.use('/planing', userPlanification)
app.use('/vmclass', userResumeClass)
app.use('/program', userPrograms)
app.use('/workshop', userWorkshops)
app.use('/workshop-planification', userWorkshopPlanifications)
app.use('/task', userTasks)
app.use('/notes', userGradebook)
app.use('/moments', userMoments)
app.use('/feed', userFeeds)
app.use('/push', userNotifications)
app.use('/notification', userNotificationsApp)
app.use('/survey', userSurvey)
app.use('/googlefit', userFitData)
app.use('/devices', userArduino)
app.use('/workshop-report', userWorkshopReport)
app.use('/dusun-sw', userDusunSmartwatch)
app.use('/chileaf', chileafDevices)
app.use('/chileaf-stocks', chileafStocks)
app.use('/medical', medicalRegistert)
app.use('/requeriment', requerimentRegister)
app.use('/hrv', hrvRegister)
app.use('/sportclub', sportClub)
app.use('/sportcategory', sportCategory)
app.use('/paymemt-admin', membershipFutbol)
app.use('/training', trainingApp)
app.use('/decentralized', institutionDecentralized)
app.use('/sportplan', sportPlanner)
app.use('/trainingResume', vmTrainingResume)
app.use('/fcm', fcm)
app.use('/appointments', car)
app.use('/gym', userGym)
app.use('/gym-admin', gym)
app.use('/aws-vm', rekoAWS)

// Transbank Routes
app.use('/transbank', transbankRoutes);


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
