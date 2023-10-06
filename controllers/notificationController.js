const Notification = require('../models/notifications')
const Teacher = require('../models/admin')
const Classrooms = require('../models/classroom')
const Students = require('../models/student')
const Workshop = require('../models/workshop')

const studentQueryPopulate = [
    {
        path: 'notifications',
        populate: [
            { path: 'classroom' },
            { path: 'workshop' },
            { path: 'createByTeacher', model: 'user', select: 'name lastName imgUrl' },
        ]
    }
];

const userQueryPopulate = [
    {
        path: 'notifications',
        populate: [
            { path: 'classroom workshop' },
            { path: 'createByStudent', model: 'student', select: 'name lastName imgUrl' },
        ]
    }
];



const notificationController = {
    createNotificationForAllStudents: async (req, res) => {
        try {
            const {
                classroomId,
                workshopId,
                teacherId,
                title,
                notificationText,
                route,
            } = req.body;

            // Verificar si classroomId o workshopId están presentes
            if (!classroomId && !workshopId) {
                return res.status(400).json({ message: 'classroomId o workshopId es requerido' });
            }

            // Buscar el teacher por su ID (esto es opcional, dependiendo de tus necesidades)
            const teacher = await Teacher.findById(teacherId);

            // Crear la notificación
            const notification = new Notification({
                classroom: classroomId,
                workshop: workshopId,
                createByTeacher: teacherId,
                title,
                notificationText,
                route,
            });

            await notification.save();

            // Actualizar las notificaciones para estudiantes en el classroom o workshop
            if (classroomId) {
                const classroom = await Classrooms.findById(classroomId);
                if (classroom) {
                    classroom.students.forEach(async (studentId) => {
                        const student = await Students.findById(studentId);
                        if (student) {
                            student.notifications.push(notification);
                            await student.save();
                        }
                    });
                }
            }

            if (workshopId) {
                const workshop = await Workshop.findById(workshopId);
                if (workshop) {
                    workshop.students.forEach(async (studentId) => {
                        const student = await Students.findById(studentId);
                        if (student) {
                            student.notifications.push(notification._id);
                            await student.save();
                        }
                    });
                }
            }

            res.status(201).json({ message: 'Notificación creada y enviada a todos los estudiantes' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },
    deleteNotificationForAllStudents: async (req, res) => {
        try {
            const { notificationId, classroomId } = req.body;

            // Verificar si notificationId y classroomId están presentes
            if (!notificationId || !classroomId) {
                return res.status(400).json({ message: 'notificationId y classroomId son requeridos' });
            }

            // Buscar el aula por su ID
            const classroom = await Classrooms.findById(classroomId);
            if (!classroom) {
                return res.status(404).json({ message: 'Aula no encontrada' });
            }

            // Eliminar la notificación de la lista de notificaciones de cada estudiante
            classroom.students.forEach(async (studentId) => {
                const student = await Students.findById(studentId);
                if (student) {
                    const index = student.notifications.findIndex(notif => notif._id.toString() === notificationId);
                    if (index !== -1) {
                        student.notifications.splice(index, 1);
                        await student.save();
                    }
                }
            });

            // Eliminar la notificación de la colección Notification
            await Notification.findByIdAndRemove(notificationId);

            res.status(200).json({ message: 'Notificación eliminada de todos los estudiantes y la colección' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },
    deleteNotificationFromStudent: async (req, res) => {
        try {
            const { studentId, notificationId } = req.params;

            // Verificar si studentId y notificationId están presentes
            if (!studentId || !notificationId) {
                return res.status(400).json({ message: 'studentId y notificationId son requeridos' });
            }

            // Buscar el estudiante por su ID
            const student = await Students.findById(studentId);
            if (!student) {
                return res.status(404).json({ message: 'Estudiante no encontrado' });
            }

            // Eliminar la notificación del array de notificaciones del estudiante
            const index = student.notifications.findIndex(notif => notif._id.toString() === notificationId);
            if (index !== -1) {
                student.notifications.splice(index, 1);
                await student.save();
            } else {
                return res.status(404).json({ message: 'Notificación no encontrada en el estudiante' });
            }

            res.status(200).json({ message: 'Notificación eliminada del estudiante' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },
    createNotificationForTeacher: async (req, res) => {
        try {
            const {
                teacherId,
                title,
                notificationText,
                route,
                studentId
            } = req.body;

            // Verificar si teacherId está presente
            if (!teacherId) {
                return res.status(400).json({ message: 'teacherId es requerido' });
            }

            // Crear la notificación
            const notification = new Notification({
                title,
                createByStudent: studentId, // Puedes establecer aquí el estudiante si lo tienes
                notificationText,
                route,
            });

            await notification.save();

            // Buscar al profesor por su ID
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ message: 'Profesor no encontrado' });
            }

            // Agregar la notificación al array de notificaciones del profesor
            teacher.notifications.push(notification);
            await teacher.save();

            res.status(201).json({ message: 'Notificación creada y asignada al profesor' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },
    deleteNotificationFromTeacher: async (req, res) => {
        try {
            const { teacherId, notificationId } = req.params;

            // Verificar si teacherId y notificationId están presentes
            if (!teacherId || !notificationId) {
                return res.status(400).json({ message: 'teacherId y notificationId son requeridos' });
            }

            // Buscar al profesor por su ID
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ message: 'Profesor no encontrado' });
            }

            // Buscar la notificación en el array de notificaciones del profesor por su _id
            const index = teacher.notifications.findIndex(notif => notif._id.toString() === notificationId);
            if (index !== -1) {
                teacher.notifications.splice(index, 1);
                await teacher.save();
                res.status(200).json({ message: 'Notificación eliminada del profesor' });
            } else {
                res.status(404).json({ message: 'Notificación no encontrada en el profesor' });
            }

            await Notification.findByIdAndRemove(notificationId);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },
    getNotificationUser: async (req, res) => {
        try {
            const { teacherId, studentId } = req.params;

            // Verificar si teacherId o studentId están presentes
            if (!teacherId && !studentId) {
                return res.status(400).json({ message: 'Debes proporcionar teacherId o studentId' });
            }

            let notifications = [];

            if (teacherId) {
                // Buscar en la colección Teacher si se proporciona teacherId
                // const teacher = await Teacher.findById(teacherId);

                const teacher = await Teacher.findById(teacherId)
                    .populate(userQueryPopulate)
                    .exec();

                if (teacher) {
                    notifications = teacher.notifications;
                }
            } else if (studentId) {
                // Buscar en la colección Students si se proporciona studentId
                // const student = await Students.findById(studentId)

                const student = await Students.findById(studentId)
                    .populate(studentQueryPopulate)
                    .exec();

                if (student) {
                    notifications = student.notifications;
                }
            }

            // Ordenar las notificaciones por createdAt de mayor a menor
            notifications.sort((a, b) => b.createdAt - a.createdAt);

            res.status(200).json({ notifications });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },
    createNotificationForStudent: async (req, res) => {
        try {
          const {
            teacherId,
            title,
            notificationText,
            route,
            studentId
          } = req.body;
    
          // Verificar si teacherId está presente
          if (!teacherId) {
            return res.status(400).json({ message: 'teacherId es requerido' });
          }
    
          // Crear la notificación
          const notification = new Notification({
            title,
            createByTeacher: teacherId,
            notificationText,
            route,
          });
    
          await notification.save();
    
          // Buscar al estudiante por su ID
          const student = await Students.findById(studentId);
          if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
          }
    
          // Agregar la notificación al array de notificaciones del estudiante
          student.notifications.push(notification);
          await student.save();
    
          res.status(201).json({ message: 'Notificación creada y asignada al estudiante' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error interno del servidor' });
        }
      },

}


module.exports = notificationController