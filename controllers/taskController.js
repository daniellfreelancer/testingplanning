const Tasks = require('../models/tasks')
const Teacher = require('../models/admin')
const Classrooms = require('../models/classroom')
const Students = require('../models/student')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto')

const bucketRegion = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET_NAME
const publicKey = process.env.AWS_PUBLIC_KEY
const privateKey = process.env.AWS_SECRET_KEY

const clientAWS = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: publicKey,
    secretAccessKey: privateKey,
  },
})

const quizIdentifier = () => crypto.randomBytes(32).toString('hex')



const taskController = {
    createTask: async (req, res) => {
        let { title, description, fileStudent, status, classroom, notation, teacher, dueDate, feedback } = req.body;

        try {
            // Crear la nueva tarea
            const newTask = new Tasks({
                title,
                description,
                fileStudent,
                status,
                classroom,
                notation,
                teacher,
                dueDate,
                feedback
            });

            // Guardar la tarea en la base de datos
            await newTask.save();

            // Buscar la información del aula
            const classroomInfo = await Classrooms.findById(classroom);

            if (!classroomInfo) {
                return res.status(400).json({
                    message: "Aula no encontrada",
                });
            }

            // Recorrer los estudiantes del aula y agregar la tarea al campo tasks
            for (const studentId of classroomInfo.students) {
                await Students.findByIdAndUpdate(studentId, {
                    $push: { tasks: newTask },
                });
            }

            res.status(200).json({
                response: newTask,
                message: "Tarea creada y asignada a estudiantes",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al crear y asignar la tarea",
            });
        }
    },
    getAllTasks: async (req, res) => {
        try {
            const tasks = await Tasks.find().sort({ createdAt: -1 });

            res.status(200).json({
                tasks,
                message: "Listado de tareas obtenido exitosamente",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al obtener el listado de tareas",
            });
        }
    },
    getTaskDetail: async (req, res) => {
        const taskId = req.params.id;

        try {
            const task = await Tasks.findById(taskId);

            if (!task) {
                return res.status(404).json({
                    message: "Tarea no encontrada",
                });
            }

            res.status(200).json({
                task,
                message: "Detalle de tarea obtenido exitosamente",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al obtener el detalle de la tarea",
            });
        }
    },
    deleteTask: async (req, res) => {
        const taskId = req.params.id;

        try {
            const task = await Tasks.findByIdAndDelete(taskId);

            if (!task) {
                return res.status(404).json({
                    message: "Tarea no encontrada",
                });
            }

            res.status(200).json({
                message: "Tarea eliminada exitosamente",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al eliminar la tarea",
            });
        }
    },
    deleteTaskFromClassroom: async (req, res) => {
        const taskId = req.params.taskId;
        const classroomId = req.params.classroomId;

        try {
            // Buscar el aula por su ID
            const classroom = await Classrooms.findById(classroomId);

            if (!classroom) {
                return res.status(404).json({
                    message: "Aula no encontrada",
                });
            }

            // Recorrer los estudiantes del aula y eliminar la tarea de sus tasks
            for (const studentId of classroom.students) {
                await Students.findByIdAndUpdate(studentId, {
                    $pull: { tasks: taskId },
                });
            }

            // Eliminar la tarea de la base de datos
            await Tasks.findByIdAndDelete(taskId);

            res.status(200).json({
                message: "Tarea eliminada de los estudiantes y del sistema",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al eliminar la tarea del aula y de los estudiantes",
            });
        }
    },
    updateTaskInClassroom: async (req, res) => {
        const taskId = req.params.taskId;
        const classroomId = req.params.classroomId;
        const { title, description, fileStudent, status, notation, dueDate } = req.body;

        try {
            // Buscar el aula por su ID
            const classroom = await Classrooms.findById(classroomId);

            if (!classroom) {
                return res.status(404).json({
                    message: "Aula no encontrada",
                });
            }

            // Buscar la tarea por su ID y actualizarla
            const updatedTask = await Tasks.findByIdAndUpdate(taskId, {
                title,
                description,
                fileStudent,
                status,
                notation,
                dueDate
            }, { new: true });

            if (!updatedTask) {
                return res.status(404).json({
                    message: "Tarea no encontrada",
                });
            }

            res.status(200).json({
                message: "Tarea actualizada en el aula",
                task: updatedTask,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al actualizar la tarea en el aula",
            });
        }
    },

    updateTaskForStudent : async (req, res) => {
        const studentId = req.params.studentId; // Obtener el id del estudiante de los parámetros de la solicitud
        const idTask = req.params.idTask; // Obtener el id de la tarea de los parámetros de la solicitud
        const updatedTaskData = req.body; // Datos para actualizar la tarea

        try {
            // Buscar al estudiante por su _id
            const student = await Students.findById(studentId);

            if (!student) {
                return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
            }

            // Buscar la tarea dentro del array de tasks del estudiante
            const taskIndex = student.tasks.findIndex(task => task._id.toString() === idTask);

            if (taskIndex === -1) {
                return res.status(404).json({ success: false, message: 'Tarea no encontrada para este estudiante' });
            }

            // Actualizar los valores de la tarea con los datos proporcionados en req.body
            student.tasks[taskIndex] = { ...student.tasks[taskIndex], ...updatedTaskData };

            // Manejar la carga de archivos si se proporciona un file en el body
            if (req.file) {
                const fileContent = req.file.buffer;
                const extension = req.file.originalname.split('.').pop();
                const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;

                const uploadParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: fileName,
                    Body: fileContent,
                };

                // Subir el archivo a S3
                const uploadCommand = new PutObjectCommand(uploadParams);
                await clientAWS.send(uploadCommand);

                student.tasks[taskIndex].fileStudent = fileName; // Actualizar el campo fileStudent
            }

            // Guardar los cambios en la base de datos
            await student.save();

            return res.status(200).json({ success: true, task: student.tasks[taskIndex], message: 'Tarea actualizada exitosamente' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al actualizar la tarea', error: error.message });
        }

    },
    deleteAllTasksFromClassroom: async (req, res) => {
        const classroomId = req.params.classroomId; // Obtener el id del aula de los parámetros de la solicitud
        const idTask = req.params.idTask; // Obtener el id de la tarea de los parámetros de la solicitud
      
        try {
          // Buscar el aula por su _id
          const classroom = await Classrooms.findById(classroomId);
      
          if (!classroom) {
            return res.status(404).json({ success: false, message: 'Aula no encontrada' });
          }
      
          // Recorrer los estudiantes del aula y eliminar la tarea del campo tasks
          for (const studentId of classroom.students) {
            const student = await Students.findById(studentId);
      
            if (student) {
              student.tasks = student.tasks.filter(task => task._id.toString() !== idTask);
              await student.save();
            }
          }
      
          return res.status(200).json({ success: true, message: 'Todas las tareas eliminadas del aula' });
        } catch (error) {
          return res.status(500).json({ success: false, message: 'Error al eliminar tareas del aula', error: error.message });
        }
      }

};


module.exports=taskController
