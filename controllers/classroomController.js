const ClassRoom = require('../models/classroom')


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
    

}

module.exports = classroomController