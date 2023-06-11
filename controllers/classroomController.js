const ClassRoom = require('../models/classroom')
const Students = require('../models/student')

const classroomQueryPopulate= [
  {
    path: 'teacher teacherSubstitute',
    select: 'name lastName email role rut logged',
  },
  {
    path: 'students',
    select: 'name lastName email role rut logged phone age weight size gender imgUrl classroom school ',
    populate: {
      path: 'classroom school',
      select : 'grade level section name'
    },
    options: {
      sort: { 'students.lastName': 1 } // ordenar por el campo "name" en orden ascendente
    }
  },
  {
    path: 'planner',
    select: 'startDate endDate duration schoolBlock content classObjectives evaluationIndicators evaluationIndicatorsTeacher learningObjectives  activities materials evaluationType otherMaterials createdAt updatedAt quiz',
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
      select : 'name lastName email grade level section'
    },

  }
]

const classroomController = {

    createClassroom : async (req, res) =>{
        try {

            const newClassroom = await new ClassRoom(req.body).save()
            if (newClassroom){

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
    addTeacherClassroom: async (req, res) => {
        try {
    
          const { classroomId, teacherId } = req.body
    
    
          // Buscar la institución por su id
          const classroom = await ClassRoom.findById(classroomId);
    
          if (!classroom) {
            return res.status(404).json({
              message: 'Salon de clase no encontrado',
              success: false
            });
          }
    
          // Agregar el nuevo id de admin a la propiedad "admin" de la institución
          classroom.teacher.push(teacherId);
    
          // Guardar los cambios en la base de datos
          await classroom.save();
    
          return res.status(200).json({
            message: 'Id de profesor agregado al salon de clase',
            success: true
          });
    
        } catch (error) {
          console.log(error);
          return res.status(400).json({
            message: 'Error al agregar id de profesor al salon de clase',
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
        let {id} = req.params;

        try {

          const classroomFund = await ClassRoom.findById(id).populate(classroomQueryPopulate)

          if (classroomFund){
            res.status(200).json({
              response: classroomFund,
              success: true,
              message: "Salon de clase encontrado"
            })
          } else res.status(404).json({message: "no se pudo encontrar el salon de clase", success: false})
          
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
          
          if (student){
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
    

}

module.exports = classroomController