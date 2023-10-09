const Tokens = require('../models/tokenFCM')
const Teacher = require('../models/admin')
const Classrooms = require('../models/classroom')
const Students = require('../models/student')
const admin = require('firebase-admin'); // Asegúrate de que Firebase Admin SDK esté configurado correctamente



const tokenFCMController = {

    enableNotification: async (req, res) => {
        const { classroom, workshop } = req.body
        const tokens = []
        const tokenTeacher = []

        let enableNotification;

        try {

            if (classroom) {
                enableNotification = new Tokens({
                    classroom: classroom,
                    tokens,
                    tokenTeacher,
                    workshop: null
                }).save()
                res.status(200).json({
                    message: "Salon de clases habilitado para recibir notificaciones",
                    success: true
                });
            } else {
                enableNotification = new Tokens({
                    workshop: workshop,
                    tokens,
                    tokenTeacher,
                    classroom: null
                }).save()

                res.status(200).json({
                    message: "Taller habilitado para recibir notificaciones",
                    success: true
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al habilitar notificaciones",
            });
        }
    },
    getClassrooms: async (req, res) => {
        try {
            const classrooms = await Tokens.find({ classroom: { $ne: null } }).populate('classroom', { grade: 1, level: 1, section: 1 });
            res.status(200).json({
                message: "Listado de aulas",
                success: true,
                data: classrooms,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al obtener aulas",
            });
        }
    },
    getWorkshops: async (req, res) => {
        try {
            const workshops = await Tokens.find({ workshop: { $ne: null } }).populate('workshop', { name: 1 });
            res.status(200).json({
                message: "Listado de talleres",
                success: true,
                data: workshops,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al obtener talleres",
            });
        }
    },
    disableNotification: async (req, res) => {
        const { classroomId, workshopId } = req.params; // Supongo que los IDs se pasan como parámetros en la URL

        try {
            if (classroomId) {
                await Tokens.findOneAndRemove({ classroom: classroomId });
                res.status(200).json({
                    message: "Notificaciones deshabilitadas para el aula",
                    success: true,
                });
            } else if (workshopId) {
                await Tokens.findOneAndRemove({ workshop: workshopId });
                res.status(200).json({
                    message: "Notificaciones deshabilitadas para el taller",
                    success: true,
                });
            } else {
                res.status(400).json({
                    message: "Debes proporcionar el ID de un aula o taller",
                    success: false,
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al deshabilitar notificaciones",
                error: error.message,
            });
        }
    },
    getAllTokens: async (req, res) => {
        try {
            const allTokens = await Tokens.find().populate('classroom').populate('workshop');
            res.status(200).json({
                message: "Listado de todos los tokens",
                success: true,
                data: allTokens,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al obtener todos los tokens",
                error: error.message,
            });
        }
    },
    addTokenUser: async (req, res) => {
        const { classroomId, workshopId, token } = req.body;

        try {
            let tokenDoc;

            if (classroomId) {
                tokenDoc = await Tokens.findOne({ classroom: classroomId });
            } else if (workshopId) {
                tokenDoc = await Tokens.findOne({ workshop: workshopId });
            } else {
                return res.status(400).json({
                    message: "Debes proporcionar el ID de un aula o taller",
                    success: false,
                });
            }

            if (!tokenDoc) {
                return res.status(404).json({
                    message: "Aula o taller no encontrado",
                    success: false,
                });
            }

            // Verificar si el token ya existe en el array tokens
            if (tokenDoc.tokens.includes(token)) {
                return res.status(400).json({
                    message: "El token ya está en la lista",
                    success: false,
                });
            }

            // Agregar el token al array tokens
            tokenDoc.tokens.push(token);
            await tokenDoc.save();

            res.status(200).json({
                message: "Token agregado con éxito",
                success: true,
                data: tokenDoc,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al agregar el token",
                error: error.message,
            });
        }
    },
    addTokenTeacher: async (req, res) => {
        const { classroomId, workshopId, token } = req.body;

        try {
            let tokenDoc;

            if (classroomId) {
                tokenDoc = await Tokens.findOne({ classroom: classroomId });
            } else if (workshopId) {
                tokenDoc = await Tokens.findOne({ workshop: workshopId });
            } else {
                return res.status(400).json({
                    message: "Debes proporcionar el ID de un aula o taller",
                    success: false,
                });
            }

            if (!tokenDoc) {
                return res.status(404).json({
                    message: "Aula o taller no encontrado",
                    success: false,
                });
            }

            // Verificar si el token ya existe en el array tokenTeacher
            if (tokenDoc.tokenTeacher.includes(token)) {
                return res.status(400).json({
                    message: "El token ya está en la lista de tokenTeacher",
                    success: false,
                });
            }

            // Agregar el token al array tokenTeacher
            tokenDoc.tokenTeacher.push(token);
            await tokenDoc.save();

            res.status(200).json({
                message: "Token de teacher agregado con éxito",
                success: true,
                data: tokenDoc,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al agregar el token de teacher",
                error: error.message,
            });
        }
    },
    removeTokenUser: async (req, res) => {
        const { classroomId, workshopId, token } = req.body;

        try {
            let tokenDoc;

            if (classroomId) {
                tokenDoc = await Tokens.findOne({ classroom: classroomId });
            } else if (workshopId) {
                tokenDoc = await Tokens.findOne({ workshop: workshopId });
            } else {
                return res.status(400).json({
                    message: "Debes proporcionar el ID de un aula o taller",
                    success: false,
                });
            }

            if (!tokenDoc) {
                return res.status(404).json({
                    message: "Aula o taller no encontrado",
                    success: false,
                });
            }

            // Eliminar el token del array tokens si se encuentra
            const tokenIndex = tokenDoc.tokens.indexOf(token);
            if (tokenIndex !== -1) {
                tokenDoc.tokens.splice(tokenIndex, 1);
                await tokenDoc.save();
                return res.status(200).json({
                    message: "Token de usuario eliminado con éxito",
                    success: true,
                    data: tokenDoc,
                });
            } else {
                return res.status(400).json({
                    message: "El token no se encuentra en la lista de tokens de usuario",
                    success: false,
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al eliminar el token de usuario",
                error: error.message,
            });
        }
    },
    removeTokenTeacher: async (req, res) => {
        const { classroomId, workshopId, token } = req.body;

        try {
            let tokenDoc;

            if (classroomId) {
                tokenDoc = await Tokens.findOne({ classroom: classroomId });
            } else if (workshopId) {
                tokenDoc = await Tokens.findOne({ workshop: workshopId });
            } else {
                return res.status(400).json({
                    message: "Debes proporcionar el ID de un aula o taller",
                    success: false,
                });
            }

            if (!tokenDoc) {
                return res.status(404).json({
                    message: "Aula o taller no encontrado",
                    success: false,
                });
            }

            // Eliminar el token del array tokenTeacher si se encuentra
            const tokenIndex = tokenDoc.tokenTeacher.indexOf(token);
            if (tokenIndex !== -1) {
                tokenDoc.tokenTeacher.splice(tokenIndex, 1);
                await tokenDoc.save();
                return res.status(200).json({
                    message: "Token de teacher eliminado con éxito",
                    success: true,
                    data: tokenDoc,
                });
            } else {
                return res.status(400).json({
                    message: "El token no se encuentra en la lista de tokens de teacher",
                    success: false,
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al eliminar el token de teacher",
                error: error.message,
            });
        }
    },
    sendNotificationUser: async (req, res) => {
        const { classroomId, workshopId, title, body } = req.body;

        try {
            let tokenDoc;

            if (classroomId) {
                tokenDoc = await Tokens.findOne({ classroom: classroomId });
            } else if (workshopId) {
                tokenDoc = await Tokens.findOne({ workshop: workshopId });
            } else {
                return res.status(400).json({
                    message: "Debes proporcionar el ID de un aula o taller",
                    success: false,
                });
            }

            if (!tokenDoc) {
                return res.status(404).json({
                    message: "Aula o taller no encontrado",
                    success: false,
                });
            }

            const tokensToSend = tokenDoc.tokens; // Obtener el array de tokens

            if (!tokensToSend || tokensToSend.length === 0) {
                return res.status(400).json({
                    message: "No hay tokens disponibles para enviar notificaciones",
                    success: false,
                });
            }

            const payload = {
                notification: {
                    title: title,
                    body: body,
                },
            };

            const response = await admin.messaging().sendMulticast({
                tokens: tokensToSend,
                notification: payload.notification,
            });

            console.log('Notificaciones enviadas:', response);
            res.status(200).json({
                message: "Notificaciones enviadas con éxito",
                success: true,
                response,
            });
        } catch (error) {
            console.error('Error al enviar notificaciones:', error);
            res.status(500).json({
                message: "Error al enviar notificaciones",
                error: error.message,
            });
        }
    },
    getTokensForStudentPush: async (req, res) => {
        const { classroomId, workshopId } = req.params; // Supongo que los IDs se pasan como parámetros en la URL
    
        try {
          let tokenDoc;
    
          if (classroomId) {
            tokenDoc = await Tokens.findOne({ classroom: classroomId });
          } else if (workshopId) {
            tokenDoc = await Tokens.findOne({ workshop: workshopId });
          } else {
            return res.status(400).json({
              message: "Debes proporcionar el ID de un aula o taller",
              success: false,
            });
          }
    
          if (!tokenDoc) {
            return res.status(404).json({
              message: "Aula o taller no encontrado",
              success: false,
            });
          }
    
          const studentTokens = tokenDoc.tokens; // Obtener el array de tokens de estudiantes
    
          res.status(200).json({
            message: "Tokens de estudiantes obtenidos con éxito",
            success: true,
            data: studentTokens,
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({
            message: "Error al obtener los tokens de estudiantes",
            error: error.message,
          });
        }
      },
      getTokensForTeacherPush: async (req, res) => {
        const { classroomId, workshopId } = req.params; // Supongo que los IDs se pasan como parámetros en la URL
    
        try {
          let tokenDoc;
    
          if (classroomId) {
            tokenDoc = await Tokens.findOne({ classroom: classroomId });
          } else if (workshopId) {
            tokenDoc = await Tokens.findOne({ workshop: workshopId });
          } else {
            return res.status(400).json({
              message: "Debes proporcionar el ID de un aula o taller",
              success: false,
            });
          }
    
          if (!tokenDoc) {
            return res.status(404).json({
              message: "Aula o taller no encontrado",
              success: false,
            });
          }
    
          const teacherTokens = tokenDoc.tokenTeacher; // Obtener el array de tokens de teachers
    
          res.status(200).json({
            message: "Tokens de teachers obtenidos con éxito",
            success: true,
            data: teacherTokens,
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({
            message: "Error al obtener los tokens de teachers",
            error: error.message,
          });
        }
      },



}

module.exports = tokenFCMController