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
const livenessRoutes = require("./routes/LivenessRoutes");

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
const servicesRoutes = require('./controllers/services/servicesRoutes')
//const userArduino = require('./routes/arduino.routes') deshabilitado por ahora
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
const webpayMallRoutes = require('./routes/webpaymall.routes');
const rekoAWS = require('./routes/awsRekonitionRoutes')
const accessControl = require('./api/access/accessRoutes')
const usersUCAD = require('./api/car/users/userCarRoutes')
const encuestaGymRoutes = require('./routes/encuestaGymRoutes');

//SISTEMA DE USUARIOS PARA COMPLEJOS/INSTITUCIONES DEPORTIVAS
const usuariosComplejosDeportivos = require('./api/usuarios-complejos/usuariosComplejosRoutes')
const institucionesDeportivas = require('./api/institucion/institucionRoutes')
const centrosDeportivos = require('./api/centros-deportivos/centrosDeportivosRoutes')
const espaciosDeportivos = require('./api/espacios-deportivos/espaciosDeportivosRoutes')
const accesoUsuariosComplejos = require('./api/acceso-usuarios-complejos/accesoUsuarioComplejosRouter')
const planesPiscinas = require('./api/gestion-planes/gestionPlanesRoutes')
const pagosPiscinas = require('./api/gestion-pagos/gestionPagosRoutes')
//Rutas para gestion de planes y suscripciones en piscinas
const suscripcionesPiscinas = require('./api/suscripcion-planes/suscripcionesRoutes')
const emailService = require('./api/email/emailServiceRoutes')
const notasUsuarios = require('./api/notas-usuarios/notasUsuariosRoutes')

//Rutas para gestion de usuarios PTE Alto
const usuariosPteAlto = require('./api/pteAlto/usuarios-pte-alto/usuariosPteAltoRoutes')
const accesoPteAlto = require('./api/pteAlto/acceso-usuarios-pte-alto/accesoPteAltoRoutes')
const complejosDeportivosPteAlto = require('./api/pteAlto/complejos-deportivos/complejosDeportivosPteAlto.routes')
const espaciosDeportivosPteAlto = require('./api/pteAlto/espacios-deportivos/espaciosDeportivosPteAlto.routes')
const talleresDeportivosPteAlto = require('./api/pteAlto/talleres-deportivos/talleresDeportivosPteAlto.routes')
const reservasPteAlto = require('./api/pteAlto/reservas-pte-alto/reservasPteAlto.routes')
const statsPteAlto = require('./api/pteAlto/stats-pte-alto/statsPteAlto.routes')
const eventosPteAlto = require('./api/pteAlto/eventos-pte-alto/eventosPteAlto.routes')
const noticiasPteAlto = require('./api/pteAlto/noticias-pte-alto/noticiaRoutes')
const navItems = require('./routes/navItem.routes')
const secciones = require('./routes/seccion.routes')
const albumesPteAlto = require('./api/pteAlto/albumes-pte-alto/albumRoutes')
const videosPteAlto = require('./api/pteAlto/videos-pte-alto/videoRoutes')
const sedesDeportivasPteAlto = require('./api/pteAlto/sedes-deportivas/sedesDeportivasPteAlto.routes')
const clubesPteAlto = require('./api/pteAlto/clubes-pte-alto/clubesPteAlto.routes')

//Rutas para gestion de usuarios UCAD
const usuariosUCAD = require('./api/car/ucad-usuarios/usuarios-ucad.routes')
const agendaUCAD = require('./api/car/ucad-agenda/agenda-ucad.routes')
const citasUCAD = require('./api/car/ucad-citas/citas-ucad.routes')
const notificacionesUCAD = require('./api/car/ucad-notificaciones/notificaciones-ucad.routes')
const accesosUCAD = require('./api/car/ucad-accesos/accesos-ucad.routes');

//Rutas para gestion de emails
const emailStudentFutbol = require('./email/emailStudentFutbol.routes')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(cors());

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));

// Body parser solo para rutas que no son multipart/form-data
app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Saltar body-parser para multipart/form-data, multer lo manejará
    return next();
  }
  bodyParser.urlencoded({ extended: false, limit: '50mb' })(req, res, next);
});

app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return next();
  }
  bodyParser.json({ limit: '50mb' })(req, res, next);
});

app.use('/public', express.static(`${__dirname}/storage/assets`))
app.use(cookieParser());


//Express Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Middleware de fileUpload - excluir rutas que usan multer
app.use((req, res, next) => {
  // Excluir rutas que usan multer para evitar conflictos
  /**
   * excluir crear y actualizar espacios deportivos de puente alto
   * excluir crear y actualizar complejos deportivos de puente alto
   * excluir crear y actualizar talleres deportivos de puente alto
   * excluir crear y actualizar noticias de puente alto
   */
  const multerRoutes = [
    '/vm-users-cd/crear-usuario-piscina',
    '/vm-users-cd/actualizar-usuario-piscina',
    '/sedes-pte-alto/crear-sede-deportiva',
    '/sedes-pte-alto/actualizar-sede-deportiva',
    '/ed-pte-alto/crear-espacio',
    '/ed-pte-alto/actualizar-espacio',
    '/cd-pte-alto/crear-complejo-deportivo',
   // '/cd-pte-alto/actualizar-complejo-deportivo',
    '/td-pte-alto/crear-taller',
    '/td-pte-alto/actualizar-taller',
    '/noticias-pte-alto',
    '/noticias-pte-alto/actualizar-noticia',
    '/eventos-pte-alto/crear-evento',
    '/eventos-pte-alto/editar-evento',
    '/albumes-pte-alto',
  ];
  
  const shouldSkip = multerRoutes.some(route => req.path.startsWith(route));
  
  if (shouldSkip) {
    return next();
  }
  
  // Aplicar fileUpload para todas las demás rutas
  fileUpload({
    useTempFiles: true,
    tempFileDir: './files',
    createParentPath: true,
    safeFileNames: true,
    preserveExtension: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
    abortOnLimit: true,
  })(req, res, next);
});

// Middleware para limpiar archivos temporales después de cada request
app.use((req, res, next) => {
  // Limpiar archivos temporales cuando la respuesta termine
  res.on('finish', () => {
    if (req.files) {
      const fs = require('fs');
      Object.values(req.files).forEach((file) => {
        const files = Array.isArray(file) ? file : [file];
        files.forEach((f) => {
          if (f.tempFilePath && fs.existsSync(f.tempFilePath)) {
            fs.unlink(f.tempFilePath, (err) => {
              if (err) console.warn('Error eliminando archivo temporal:', err.message);
            });
          }
        });
      });
    }
  });
  next();
});

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
app.use('/services', servicesRoutes)
//app.use('/devices', userArduino)
app.use('/workshop-report', userWorkshopReport)
app.use('/dusun-sw', userDusunSmartwatch)
app.use('/chileaf', chileafDevices)
app.use('/chileaf-stocks', chileafStocks)
app.use('/medical', medicalRegistert)
app.use('/requeriment', requerimentRegister)
app.use('/hrv', hrvRegister)
app.use('/sportclub', sportClub)
app.use('/sportcategory', sportCategory)
app.use('/paymemt-futbol', membershipFutbol)
app.use('/training', trainingApp)
app.use('/decentralized', institutionDecentralized)
app.use('/sportplan', sportPlanner)
app.use('/trainingResume', vmTrainingResume)
app.use('/fcm', fcm)
app.use('/appointments', car)
app.use('/gym', userGym)
app.use('/gym-admin', gym)
app.use('/aws-vm', rekoAWS)
app.use('/api/encuestas', encuestaGymRoutes);
app.use('/planes-piscinas', planesPiscinas)
app.use('/pagos-piscinas', pagosPiscinas)
app.use('/suscripciones-piscinas', suscripcionesPiscinas)

//Rutas para gestion de emails
app.use('/email-student-futbol', emailStudentFutbol)
// Transbank Routes
app.use('/transbank', transbankRoutes); // Rutas webpay plus
app.use('/webpaymall', webpayMallRoutes); // Rutas webpay mall

//Rutas para gestion de usuarios PTE Alto
app.use('/pte-alto', usuariosPteAlto)
app.use('/acceso-pte-alto', accesoPteAlto)
app.use('/cd-pte-alto', complejosDeportivosPteAlto)
app.use('/ed-pte-alto', espaciosDeportivosPteAlto)
app.use('/td-pte-alto', talleresDeportivosPteAlto)
app.use('/reservas-pte-alto', reservasPteAlto)
app.use('/stats-pte-alto', statsPteAlto)
app.use('/eventos-pte-alto', eventosPteAlto)
app.use('/noticias-pte-alto', noticiasPteAlto)
app.use('/nav-items', navItems)
app.use('/secciones', secciones)
app.use('/albumes-pte-alto', albumesPteAlto)
app.use('/videos-pte-alto', videosPteAlto)
app.use('/sedes-pte-alto', sedesDeportivasPteAlto)
app.use('/clubes-pte-alto', clubesPteAlto)
//Rutas para gestion de usuarios UCAD
app.use('/usuarios-ucad', usuariosUCAD)
app.use('/ucad-agenda', agendaUCAD)
app.use('/ucad-citas', citasUCAD)
app.use('/ucad-notificaciones', notificacionesUCAD)
app.use('/ucad-accesos', accesosUCAD);




// Liveness Routes
app.use("/liveness", livenessRoutes);

app.use('/access', accessControl)
app.use('/users-car', usersUCAD)
app.use('/vm-users-cd', usuariosComplejosDeportivos) // usuarios complejos deportivos
app.use('/vm-instituciones-deportivas', institucionesDeportivas) // instituciones deportivas
app.use('/vm-centros-deportivos', centrosDeportivos) // centros deportivos
app.use('/vm-espacios-deportivos', espaciosDeportivos) // espacios deportivos
app.use('/acceso-usuarios-complejos', accesoUsuariosComplejos) // acceso usuarios complejos
app.use('/email-service', emailService)
app.use('/api/notas-usuarios', notasUsuarios) // notas de usuarios


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.error('Error capturado por handler global:', err);

  // Si es una solicitud API (JSON), devolver JSON
  if (req.originalUrl.startsWith('/api') || req.originalUrl.includes('pte-alto') || req.originalUrl.includes('ucad')) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // Para otras rutas, renderizar página de error
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
