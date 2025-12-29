const Students = require('../models/student');
const bcryptjs = require('bcryptjs');
const Tasks = require('../models/tasks');
const Classrooms = require('../models/classroom');
const Workshops = require('../models/workshop');

// ⬇️ Nuevo: usamos el helper centralizado de S3
const { uploadMulterFile } = require('../utils/s3Client');

const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

const studentQueryPopulate = [
  {
    path: 'classroom school workshop program tasks',
    select:
      'grade level section name  title description fileStudent status classroom notation teacher dueDate',
  },
];

// helper para obtener URL de CloudFront
// Si ya es una URL completa (CloudFront), la devuelve tal cual
// Si es un key antiguo, genera la URL de CloudFront
function attachCloudFrontUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${cloudfrontUrl}/${url}`;
}

// helper para aplicar URLs de CloudFront a un estudiante
function attachStudentCloudFrontUrls(studentDoc) {
  if (!studentDoc) return studentDoc;

  const plain = studentDoc.toObject ? studentDoc.toObject() : studentDoc;

  try {
    // Aplicar URL a imgUrl del estudiante
    if (plain.imgUrl) {
      plain.imgUrl = attachCloudFrontUrl(plain.imgUrl);
    }

    // Aplicar URLs a las tareas del estudiante
    if (Array.isArray(plain.tasks)) {
      plain.tasks = plain.tasks.map(task => {
        if (task.fileStudent) {
          task.fileStudent = attachCloudFrontUrl(task.fileStudent);
        }
        return task;
      });
    }
  } catch (err) {
    console.error('Error generando URLs para estudiante:', err);
  }

  return plain;
}

const studentController = {
  create: async (req, res) => {
    let {
      rut,
      password,
      name,
      lastName,
      age,
      weight,
      size,
      classroom,
      school,
      email,
      phone,
      gender,
      workshop,
      program,
      school_representative,
      bio,
      from,
      role,
      birth,
      institution,
    } = req.body;

    try {
      if (from !== 'form') {
        return res.status(400).json({
          message:
            'No se puede crear su cuenta, por favor contacte a su administrador',
          success: false,
        });
      }

      let temporalPassword = 'vitalmove';

      let newStudent = await Students.findOne({ rut });

      if (!newStudent) {
        newStudent = await Students.findOne({ email });

        if (!newStudent) {
          let logged = false;
          let imgUrl;
          let tasks = [];
          let verified = true;

          password =
            password && password.length > 0
              ? bcryptjs.hashSync(password, 10)
              : bcryptjs.hashSync(temporalPassword, 10);

          newStudent = new Students({
            rut,
            password,
            name,
            lastName,
            age,
            weight,
            size,
            classroom,
            school,
            email,
            phone,
            gender,
            school_representative,
            role,
            logged,
            workshop,
            program,
            bio,
            imgUrl,
            tasks,
            verified,
            role,
            birth,
            institution,
          });

          // ⬇️ Subir foto de perfil a S3 usando helper centralizado
          if (req.file) {
            const key = await uploadMulterFile(req.file);
            // Generamos la URL de CloudFront
            newStudent.imgUrl = `${cloudfrontUrl}/${key}`;
          }

          await newStudent.save();

          // Aplicar URLs de CloudFront
          const studentWithUrls = attachStudentCloudFrontUrls(newStudent);

          res.status(200).json({
            response: studentWithUrls,
            message: 'Estudiante creado con exito',
            success: true,
          });
        } else {
          if (newStudent.from.includes(from)) {
            return res.status(400).json({
              message:
                'El email ingresado ya existe en nuestra base de datos',
              success: false,
            });
          } else {
            newStudent.from.push(from);
            adminUser.password.push(bcryptjs.hashSync(password, 10));
            await newStudent.save();
            res.status(201).json({
              message: 'Estudiante ha creado su cuenta desde: ' + from,
              success: true,
            });
          }
        }
      } else {
        res.status(400).json({
          message:
            'Estudiante ya existe en la base de datos, verifica tu numero de RUT',
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error.message, success: false });
    }
  },

  getStudentDetail: async (req, res) => {
    let id = req.params.id;

    try {
      let student = await Students.findById(id).populate(
        studentQueryPopulate,
      );

      if (!student) {
        return res.status(404).json({
          message: 'Estudiante no encontrado',
          success: false,
        });
      }

      // Aplicar URLs de CloudFront
      student = attachStudentCloudFrontUrls(student);

      res.status(200).json({
        student,
        message: 'Estudiante encontrado',
        success: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al obtener el detalle del estudiante',
      });
    }
  },

  updateTask: async (req, res) => {
    const studentId = req.params.studentId;
    const taskId = req.params.taskId;

    try {
      const student = await Students.findById(studentId);

      if (!student) {
        return res.status(404).json({
          message: 'Estudiante no encontrado',
        });
      }

      const taskIndex = student.tasks.findIndex(
        (task) => task._id.toString() === taskId,
      );

      if (taskIndex === -1) {
        return res.status(404).json({
          message: 'Tarea no encontrada en el array de tareas del estudiante',
        });
      }

      const task = student.tasks[taskIndex];

      // ⬇️ Subir archivo de tarea a S3 usando helper centralizado
      if (req.file) {
        const key = await uploadMulterFile(req.file);
        // Generamos la URL de CloudFront
        task.fileStudent = `${cloudfrontUrl}/${key}`;
      }

      task.status = 'DONE';

      await student.save();

      // Aplicar URLs de CloudFront
      const studentWithUrls = attachStudentCloudFrontUrls(student);

      res.status(200).json({
        response: studentWithUrls,
        message: 'Tarea actualizada exitosamente',
        success: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al actualizar la tarea',
      });
    }
  },

  findTaskByStudent: async (req, res) => {
    const studentId = req.params.studentId;
    const idTask = req.params.idTask;

    try {
      const student = await Students.findById(studentId);

      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: 'Estudiante no encontrado' });
      }

      const task = student.tasks.find(
        (task) => task._id.toString() === idTask,
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada para este estudiante',
        });
      }

      // Aplicar URL de CloudFront al archivo de la tarea
      const taskWithUrl = {
        ...task.toObject ? task.toObject() : task,
        fileStudent: task.fileStudent ? attachCloudFrontUrl(task.fileStudent) : task.fileStudent,
      };

      return res.status(200).json({
        success: true,
        task: taskWithUrl,
        message: 'Estudiante y tarea encontrados',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al buscar el estudiante y la tarea',
        error: error.message,
      });
    }
  },

  updateTaskById: async (req, res) => {
    const studentId = req.params.studentId;
    const idTask = req.params.idTask;
    const updatedTaskData = req.body;

    try {
      const student = await Students.findById(studentId);

      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: 'Estudiante no encontrado' });
      }

      const taskIndex = student.tasks.findIndex(
        (task) => task._id.toString() === idTask,
      );

      if (taskIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada para este estudiante',
        });
      }

      student.tasks[taskIndex] = {
        ...student.tasks[taskIndex]._doc,
        ...updatedTaskData,
      };

      // ⬇️ Subir archivo si viene uno nuevo
      if (req.file) {
        const key = await uploadMulterFile(req.file);
        // Generamos la URL de CloudFront
        student.tasks[taskIndex].fileStudent = `${cloudfrontUrl}/${key}`;
      }

      await student.save();

      // Aplicar URL de CloudFront al archivo de la tarea
      const taskWithUrl = {
        ...student.tasks[taskIndex].toObject ? student.tasks[taskIndex].toObject() : student.tasks[taskIndex],
        fileStudent: student.tasks[taskIndex].fileStudent ? attachCloudFrontUrl(student.tasks[taskIndex].fileStudent) : student.tasks[taskIndex].fileStudent,
      };

      return res.status(200).json({
        success: true,
        task: taskWithUrl,
        message: 'Tarea actualizada exitosamente',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar la tarea',
        error: error.message,
      });
    }
  },

  getStudentsByfilter: async (req, res) => {
    try {
      const filterType = req.query.filterType;
      const filterValue = req.query.filterValue;
      const limit = parseInt(req.query.limit) || 0;

      let options = {
        path: 'students',
        select: 'name lastName imgUrl logged size age email phone',
        options: {
          sort: { lastName: 1 },
          limit: limit,
        },
      };

      if (filterType === 'classroom') {
        const classroom = await Classrooms.findById(filterValue).populate(
          options,
        );

        if (classroom) {
          // Aplicar URLs de CloudFront a todos los estudiantes
          const studentsWithUrls = classroom.students.map(student => 
            attachStudentCloudFrontUrls(student)
          );

          res.status(200).json({
            success: true,
            response: studentsWithUrls,
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'No se encontraron estudiantes',
          });
        }
      }

      if (filterType === 'workshop') {
        const workshop = await Workshops.findById(filterValue).populate(
          options,
        );

        if (workshop) {
          // Aplicar URLs de CloudFront a todos los estudiantes
          const studentsWithUrls = workshop.students.map(student => 
            attachStudentCloudFrontUrls(student)
          );

          res.status(200).json({
            success: true,
            response: studentsWithUrls,
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'No se encontraron estudiantes',
          });
        }
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: 'Error al intentar traer los estudiantes' });
    }
  },

  getStudents: async (req, res) => {
    try {
      let students = await Students.find();

      if (students) {
        // Aplicar URLs de CloudFront a todos los estudiantes
        students = students.map(student => attachStudentCloudFrontUrls(student));

        res.status(200).json({
          success: true,
          response: students,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron estudiantes',
        });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: 'Error al intentar traer los estudiantes' });
    }
  },

  updateStudent: async (req, res) => {
    try {
      const { id } = req.params;

      let updatedStudent = await Students.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!updatedStudent) {
        return res.status(404).json({
          success: false,
          message: 'Estudiante no encontrado',
        });
      }

      // Aplicar URLs de CloudFront
      updatedStudent = attachStudentCloudFrontUrls(updatedStudent);

      return res.status(200).json({
        success: true,
        message: 'Estudiante actualizado correctamente',
        response: updatedStudent,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  deleteStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedStudent = await Students.findByIdAndDelete(id);

      if (!deletedStudent) {
        return res.status(404).json({
          success: false,
          message: 'Estudiante no encontrado',
        });
      }

      await Workshops.updateMany(
        { students: id },
        { $pull: { students: id } },
      );

      return res.status(200).json({
        success: true,
        message: 'Estudiante eliminado correctamente',
        response: deletedStudent,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  getStudentsAll: async (req, res) => {
    try {
      let students = await Students.find();

      // Aplicar URLs de CloudFront a todos los estudiantes
      students = students.map(student => attachStudentCloudFrontUrls(student));

      return res.status(200).json({
        success: true,
        message: 'Estudiantes encontrados correctamente',
        response: students,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = studentController;
