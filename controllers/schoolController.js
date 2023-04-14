const Schools = require('../models/school')


const schoolControllers = {

    createSchool : async (req, res) =>{

        try {

            const newSchool = await new Schools(req.body).save()

            if (newSchool) {
                res.status(200).json({
                    message: "Escuela creada con exito",
                    response: newSchool,
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "Error al crear escuela",
                    success: false
                })
            }

            
        } catch (error) {
            console.log(error)
            res.status(400).json({
                message: error.message,
                success: false
            })
        }

    },
    addAdminToSchool: async (req, res) => {
        try {
    
          const { schoolId, adminId } = req.body
    
    
          // Buscar la institución por su id
          const school = await Schools.findById(schoolId);
    
          if (!school) {
            return res.status(404).json({
              message: 'Escuela no encontrada',
              success: false
            });
          }
    
          // Agregar el nuevo id de admin a la propiedad "admin" de la institución
          school.admins.push(adminId);
    
          // Guardar los cambios en la base de datos
          await school.save();
    
          return res.status(200).json({
            message: 'Id de admin agregado a la Escuela',
            success: true
          });
    
        } catch (error) {
          console.log(error);
          return res.status(400).json({
            message: 'Error al agregar id de admin a la Escuela',
            success: false
          });
        }
      },
      removeAdminFromSchool: async (req, res) => {
        try {
          const { schoolId, adminId } = req.body
    
          // Buscar la institución por su id
          const school = await Schools.findById(schoolId);
    
          if (!school) {
            return res.status(404).json({
              message: 'Institución no encontrada',
              success: false
            });
          }
    
          // Encontrar el índice del id de admin en la propiedad "admin" de la institución
          const adminIndex = school.admins.indexOf(adminId);
    
          if (adminIndex === -1) {
            return res.status(404).json({
              message: 'Admin no encontrado en la Escuela',
              success: false
            });
          }
    
          // Eliminar el id de admin de la propiedad "admin" de la institución
          school.admins.splice(adminIndex, 1);
    
          // Guardar los cambios en la base de datos
          await school.save();
    
          return res.status(200).json({
            message: 'Id de admin eliminado de la Escuela',
            success: true
          });
    
        } catch (error) {
          console.log(error);
          return res.status(400).json({
            message: 'Error al eliminar id de admin de la Escuela',
            success: false
          });
        }
      },
      addClassroomToSchool: async (req, res) => {
        try {
    
          const { schoolId, classroomId } = req.body
    
    
          // Buscar la institución por su id
          const school = await Schools.findById(schoolId);
    
          if (!school) {
            return res.status(404).json({
              message: 'Escuela no encontrada',
              success: false
            });
          }
    
          // Agregar el nuevo id de admin a la propiedad "classrooms" de la institución
          school.classrooms.push(classroomId);
    
          // Guardar los cambios en la base de datos
          await school.save();
    
          return res.status(200).json({
            message: 'Id de salon de clase agregado a la Escuela',
            success: true
          });
    
        } catch (error) {
          console.log(error);
          return res.status(400).json({
            message: 'Error al agregar id de salon de clase a la Escuela',
            success: false
          });
        }
      },
  addTeacherToSchool: async (req, res) => {
    try {
      const { schoolId, teacherId } = req.body
      // Buscar la institución por su id
      const school = await Schools.findById(schoolId);
      if (!school) {
        return res.status(404).json({
          message: 'Escuela no encontrada',
          success: false
        });
      }

      school.teachers.push(teacherId);
      await school.save();

      return res.status(200).json({
        message: 'Id de profesor agregado a la Escuela',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar id de profesor a la Escuela',
        success: false
      });
    }
  },
  addStudentToSchool: async (req, res) => {
    try {
      const { schoolId, studentId } = req.body
      const school = await Schools.findById(schoolId);
      if (!school) {
        return res.status(404).json({
          message: 'Escuela no encontrada',
          success: false
        });
      }

      school.students.push(studentId);
      await school.save();

      return res.status(200).json({
        message: 'Id de estudiante agregado a la Escuela',
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

module.exports = schoolControllers