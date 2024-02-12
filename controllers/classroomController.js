const ClassRoom = require('../models/classroom')
const Students = require('../models/student')
const Users = require('../models/admin')
const Schools = require('../models/school')

const classroomQueryPopulate = [
  {
    path: 'teacher teacherSubstitute',
    select: 'name lastName email role rut logged classroom workshop program school imgUrl ',
    options: {
      sort: { 'lastName': 1 } // ordenar por el campo "name" en orden ascendente
    }
  },
  {
    path: 'students',
    select: 'name lastName email role rut logged phone age weight size gender imgUrl classroom school tasks',
    populate: {
      path: 'classroom school tasks gradebook',
      select: 'grade level section name  title description fileStudent status classroom notation teacher dueDate deliveryDate feedback gradeBook'
    },
    options: {
      sort: { 'lastName': 1 } // ordenar por el campo "name" en orden ascendente
    }
  },
  {
    path: 'planner',
    select: 'startDate endDate duration schoolBlock content classObjectives evaluationIndicators evaluationIndicatorsTeacher learningObjectives  activities materials evaluationType otherMaterials createdAt updatedAt quiz classroom',
    populate: {
      path: 'classroom',
      select: 'grade level section'
    }
  },
  {
    path: 'classHistory',
    populate: {
      path: 'plannerClass',

    },
  },
  {
    path: 'classHistory',
    populate: {
      path: 'byTeacher classroomId',
      select: 'name lastName email grade level section'
    },

  }
]

const classroomController = {

  createClassroom: async (req, res) => {
    try {

      const newClassroom = await new ClassRoom(req.body).save()
      if (newClassroom) {

        res.status(200).json({
          response: newClassroom,
          message: "Salon de clase creado con exito",
          success: true
        })

      } else {
        res.status(404).json({
          message: "No se pudo crear salon de clase creado con exito",
          success: false
        })
      }


    } catch (error) {
      console.log(error)
      res.status(400).json({
        message: "Error al crear salon de clase",
        success: false
      })
    }
  },
  // addTeacherClassroom: async (req, res) => {

  //     try {

  //       const { classroomId, teacherId } = req.body


  //       // Buscar la institución por su id
  //       const classroom = await ClassRoom.findById(classroomId);

  //       if (!classroom) {
  //         return res.status(404).json({
  //           message: 'Salon de clase no encontrado',
  //           success: false
  //         });
  //       }

  //       // Agregar el nuevo id de admin a la propiedad "admin" de la institución
  //       classroom.teacher.push(teacherId);

  //       // Guardar los cambios en la base de datos
  //       await classroom.save();

  //               // Buscar el objeto teacher en la colección Users
  //     const teacher = await Users.findById(teacherId);

  //     if (!teacher) {
  //         return res.status(404).json({
  //             message: 'Profesor no encontrado',
  //             success: false
  //         });
  //     }

  //     // Agregar el id del salón de clase al array "classroom" del objeto teacher
  //     teacher.classroom.push(classroomId);

  //     // Guardar los cambios en el objeto teacher
  //     await teacher.save();

  //       return res.status(200).json({
  //         message: 'Id de profesor agregado al salon de clase',
  //         success: true
  //       });

  //     } catch (error) {
  //       console.log(error);
  //       return res.status(400).json({
  //         message: 'Error al agregar id de profesor al salon de clase',
  //         success: false
  //       });
  //     }
  //   },
  addTeacherClassroom: async (req, res) => {
    try {
      const { classroomId, teacherId } = req.body;

      // Buscar el salón de clase por su id
      const classroom = await ClassRoom.findById(classroomId);

      if (!classroom) {
        return res.status(404).json({
          message: 'Salón de clase no encontrado',
          success: false
        });
      }

      // Verificar si el teacher ya está agregado al salón de clase
      if (classroom.teacher.includes(teacherId)) {
        return res.status(200).json({
          message: 'El profesor ya se encuentra asignado a este salón de clase',
          success: true
        });
      }

      // Agregar el nuevo id de profesor al array "teacher" del salón de clase
      classroom.teacher.push(teacherId);

      // Guardar los cambios en la base de datos
      await classroom.save();

      // Buscar el objeto teacher en la colección Users
      const teacher = await Users.findById(teacherId);

      if (!teacher) {
        return res.status(404).json({
          message: 'Profesor no encontrado',
          success: false
        });
      }

      // Verificar si el salón de clase ya está agregado al teacher
      if (teacher.classroom.includes(classroomId)) {
        return res.status(400).json({
          message: 'Este salón de clase ya está agregado al profesor',
          success: false
        });
      }

      // Agregar el id del salón de clase al array "classroom" del objeto teacher
      teacher.classroom.push(classroomId);

      // Guardar los cambios en el objeto teacher
      await teacher.save();

      return res.status(200).json({
        message: 'Profesor asignado al salon de clase con exito',
        success: true
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar id de profesor al salón de clase',
        success: false
      });
    }
  },
  addTeacherSubstituteClassroom: async (req, res) => {
    try {

      const { classroomId, teacherSubsId } = req.body


      // Buscar la institución por su id
      const classroom = await ClassRoom.findById(classroomId);

      if (!classroom) {
        return res.status(404).json({
          message: 'Salon de clase no encontrado',
          success: false
        });
      }

      // Agregar el nuevo id de admin a la propiedad "admin" de la institución
      classroom.teacherSubstitute.push(teacherSubsId);

      // Guardar los cambios en la base de datos
      await classroom.save();

      return res.status(200).json({
        message: 'Id de profesor suplente agregado al salon de clase',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar id de profesor suplente al salon de clase',
        success: false
      });
    }
  },
  classroomById: async (req, res) => {
    let { id } = req.params;

    try {

      const classroomFund = await ClassRoom.findById(id).populate(classroomQueryPopulate)

      if (classroomFund) {
        res.status(200).json({
          response: classroomFund,
          success: true,
          message: "Salon de clase encontrado"
        })
      } else res.status(404).json({ message: "no se pudo encontrar el salon de clase", success: false })

    } catch (error) {
      console.log(error)
      res.status(400).json({
        message: "Error al realizar peticion de busqueda de busqueda",
        success: false
      })
    }

  },
  addStudentToClassroom: async (req, res) => {
    try {
      const { classroomId, studentId } = req.body
      const classroom = await ClassRoom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({
          message: 'Salon de clase no encontrado',
          success: false
        });
      }

      classroom.students.push(studentId);
      await classroom.save();
      const student = await Students.findById(studentId)

      if (student) {
        student.classroom.push(classroomId);
        await student.save()
      }

      return res.status(200).json({
        message: 'Estudiante agregado con exito al salon de clase',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar id de estudiante a la Escuela',
        success: false
      });
    }
  },
  getClassRoomsAll: async (req, res) => {
    try {
      const allClassRooms = await ClassRoom.find().populate(classroomQueryPopulate);
      if (allClassRooms) {
        res.status(200).json({
          message: 'Cursos encontrados',
          response: allClassRooms,
          success: true
        });
      } else {
        res.status(404).json({
          message: 'No se encontraron cursos disponibles',
          success: false
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error en el servidor',
        success: false
      });
    }
  },
  updateClassroom: async (req, res) => {
    let classroomId = req.params.id;
    const update = req.body

    try {

      const updatedClassroom = await ClassRoom.findByIdAndUpdate(
        classroomId,
        update,
        { new: true } //devuelve los cambios hechos
      )

      if (updatedClassroom) {
        res.status(200).json({
          message: 'Curso actualizado con exito',
          success: true
        });
      } else {
        res.status(404).json({
          message: 'Curso no encontrado',
          success: false
        });
      }


    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al actualizar el curso',
        success: false
      });
    }


  },
  deleteClassroom : async (req, res) => {

    try {
      const { id, schoolId } = req.params

      const school = await Schools.findById(schoolId)
      if (school) {
        
        const schoolIndex = school.classrooms.indexOf(id)

        school.classrooms.splice(schoolIndex, 1)

        await  school.save()

        const deletedClassroom = await ClassRoom.findByIdAndDelete(id)

        res.status(200).json({
          message: 'Curso eliminado con exito',
          success: true,
          response: deletedClassroom
        });
      } else {
        res.status(404).json({
          message: 'curso no encontrado',
          success: false
        });
      }


      
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al eliminar el curso',
        success: false
      });
    }




  }


}

module.exports = classroomController