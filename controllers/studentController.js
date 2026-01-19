const Students = require('../models/student');
const bcryptjs = require('bcryptjs');
const Tasks = require('../models/tasks');
const Classrooms = require('../models/classroom');
const Workshops = require('../models/workshop');
const Representative = require('../models/representative');
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
    console.log('[STUDENT CREATE] Iniciando creación de estudiante');
    let {
      rut,
      name,
      lastName,
      gender,
      workshop,
      program,
      birth,
      nameRepresentative,
      lastNameRepresentative,
      emailRepresentative,
      phoneRepresentative,
      rutRepresentative,
    } = req.body;

    console.log('[STUDENT CREATE] Datos recibidos:', {
      rut,
      name,
      lastName,
      gender,
      workshop,
      program,
      birth,
      nameRepresentative,
      lastNameRepresentative,
      emailRepresentative,
      phoneRepresentative,
      rutRepresentative,
    });

    try {

      let temporalPassword = rut;

      //hash password
      const hashedPassword = bcryptjs.hashSync(temporalPassword, 10);

      const newStudent = new Students({
        rut,
        name,
        lastName,
        gender,
        workshop,
        program,
        birth,
        password: [hashedPassword],
        role: 'ESTU',
      });
      await newStudent.save();


      const rutReprensentativePassword = rutRepresentative;
      const hashedPasswordRepresentative = bcryptjs.hashSync(rutReprensentativePassword, 10);

      // validar si el rut o email del representante ya existe para crearlo sino para agregar el id del nuevo estudiante
      console.log('[STUDENT CREATE] Buscando representante con RUT:', rutRepresentative);
      const representativeExists = await Representative.findOne({ rut: rutRepresentative });
      
      if (representativeExists) {
        console.log('[STUDENT CREATE] Representante encontrado, agregando estudiante a children');
        representativeExists.children.push(newStudent._id);
        await representativeExists.save();
        newStudent.school_representative = representativeExists._id;
        await newStudent.save();
        console.log('[STUDENT CREATE] Estudiante vinculado a representante existente:', representativeExists._id);
      } else {
        console.log('[STUDENT CREATE] Creando nuevo representante');
        const newRepresentative = new Representative({
          name: nameRepresentative,
          lastName: lastNameRepresentative,
          email: emailRepresentative,
          phone: phoneRepresentative,
          rut: rutRepresentative,
          children: [newStudent._id],
          password: [hashedPasswordRepresentative],
          role: 'REPRE',
        });

        await newRepresentative.save();
        newStudent.school_representative = newRepresentative._id;
        await newStudent.save();
        console.log('[STUDENT CREATE] Nuevo representante creado:', newRepresentative._id);
      }

      // response (siempre se responde, tanto si el representante existe como si no)
      console.log('[STUDENT CREATE] Estudiante creado exitosamente:', newStudent._id);
      return res.status(200).json({
        message: 'Estudiante registrado correctamente',
        success: true,
        response: newStudent._id,
      });

      } catch (error) {
        console.error('[STUDENT CREATE] Error al crear estudiante:', error);
        return res.status(400).json({ message: error.message, success: false });
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
                    getStudentDetail: async (req, res) => {
                      try {
                        const { id } = req.params;
                        const student = await Students.findById(id);
                        if (!student) {
                          return res.status(404).json({
                            success: false,
                            message: 'Estudiante no encontrado',
                          });
                        }
                        // Aplicar URLs de CloudFront
                        student = attachStudentCloudFrontUrls(student);
                        return res.status(200).json({
                          success: true,
                          message: 'Estudiante encontrado correctamente',
                          response: student,
                        });
                      } catch (error) {
                        console.log(error);
                        res.status(500).json({
                          success: false,
                          message: error.message,
                        });
                      }
                    },
                      getStudentByRut: async (req, res) => {
                        try {
                          const { rut } = req.params;
                          const student = await Students.findOne({ rut });
                          if (!student) {
                            return res.status(200).json({
                              success: true,
                              message: 'Estudiante no encontrado, continua con el registro',
                            });
                          } else {

                            return res.status(200).json({
                              success: true,
                              message: 'Estudiante registrado, ingrese otro rut',
                              response: student,
                            });
                          }
                          // Aplicar URLs de CloudFront

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
