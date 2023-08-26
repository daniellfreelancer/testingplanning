const Workshops = require('../models/workshop')
const Students = require('../models/student')

const workshopQueryPopulate= [
  {
    path: 'teacher teacherSubstitute',
    select: 'name lastName email role rut logged',
  },
  {
    path: 'students',
    select: 'name lastName email role rut logged phone age weight size gender imgUrl classroom school ',
    populate: {
      path: 'workshop program',
      select : 'name'
    },
    options: {
      sort: { 'students.lastName': 1 } // ordenar por el campo "name" en orden ascendente
    }
  },
  {
    path: 'planner',
    select: 'startDate endDate duration schoolBlock content classObjectives evaluationIndicators evaluationIndicatorsTeacher learningObjectives  activities materials evaluationType otherMaterials createdAt updatedAt quiz workshop',
    populate:{
      path: 'workshop',
      select: 'name'
    },
    options: {
      sort: { 'startDate': 1 }
    }
  },
  {
    path: 'workshopHistory',
    populate: {
      path: 'plannerClass',
     
    },
  },

]

const workshopController = {

    createWorkshop : async (req, res) =>{
        try {

            const newWorkshop = await new Workshops(req.body).save()

            if (newWorkshop){

                res.status(200).json({
                    response: newWorkshop,
                    message: "taller educativo creado con exito",
                    success: true
                })

            } else {
                res.status(404).json({
                    message: "No se pudo crear taller educativo con exito",
                    success: false
                })
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({
                message: "Error al crear taller educativo",
                success: false
            })
        }
    },
    addTeacherWorkshop: async (req, res) => {
        try {
          const { workshopId, teacherId } = req.body

          // Buscar el taller por su id
          const workshop = await Workshops.findById(workshopId);
    
          if (!workshop) {
            return res.status(404).json({
              message: 'Taller no encontrado',
              success: false
            });
          }
    
          // Agregar el nuevo id profesor al taller
          workshop.teacher.push(teacherId);
    
          // Guardar los cambios en la base de datos
          await workshop.save();
    
          return res.status(200).json({
            message: 'Id de profesor agregado al taller',
            success: true
          });
    
        } catch (error) {
          console.log(error);
          return res.status(400).json({
            message: 'Error al agregar id de profesor al taller',
            success: false
          });
        }
      },
      addTeacherSubstituteWorkshop: async (req, res) => {
        try {
    
          const { workshopId, teacherSubsId } = req.body
    
    
          // Buscar taller por su id
          const workshop = await Workshops.findById(workshopId);
    
          if (!workshop) {
            return res.status(404).json({
              message: 'Taller no encontrado',
              success: false
            });
          }
    
            // Agregar el nuevo id profesor sustituto al taller
          workshop.teacherSubstitute.push(teacherSubsId);
    
          // Guardar los cambios en la base de datos
          await workshop.save();
    
          return res.status(200).json({
            message: 'Id de profesor suplente agregado al taller',
            success: true
          });
    
        } catch (error) {
          console.log(error);
          return res.status(400).json({
            message: 'Error al agregar id de profesor suplente al taller',
            success: false
          });
        }
      },
      workshopById: async (req, res) => {
        let {id} = req.params;

        try {

          const workshopFund = await Workshops.findById(id).populate(workshopQueryPopulate)

          if (workshopFund){
            res.status(200).json({
              response: workshopFund,
              success: true,
              message: "taller encontrado"
            })
          } else res.status(404).json({message: "no se pudo encontrar el taller", success: false})
          
        } catch (error) {
          console.log(error)
          res.status(400).json({
            message: "Error al realizar peticion de busqueda de busqueda",
            success: false
          })
        }

      },
      addStudentToWorkshop: async (req, res) => {
        try {
          const { workshopId, studentId } = req.body
          const workshop = await Workshops.findById(workshopId);
          if (!workshop) {
            return res.status(404).json({
              message: 'Taller no encontrado',
              success: false
            });
          }
    
          workshop.students.push(studentId);
          await workshop.save();
          const student = await Students.findById(studentId)
          
          if (student){
            student.classroom.push(workshopId);
            await student.save()
          }
         
          return res.status(200).json({
            message: 'Estudiante agregado con exito al taller',
            success: true
          });
    
        } catch (error) {
          console.log(error);
          return res.status(400).json({
            message: 'Error al agregar id de estudiante al taller',
            success: false
          });
        }
      },
    

}

module.exports = workshopController