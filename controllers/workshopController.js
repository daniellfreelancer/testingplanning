const Workshops = require('../models/workshop')
const Students = require('../models/student')
const Teachers = require('../models/admin')
const Programs = require('../models/program')

const workshopQueryPopulate = [
  {
    path: 'teacher',
    select: 'name lastName email role rut logged imgUrl workshop program',
  },
  {
    path: 'students',
    select: 'name lastName email role rut logged phone age weight size gender imgUrl classroom school ',
    populate: {
      path: 'workshop program',
      select: 'name'
    },
    options: {
      sort: { 'students.lastName': 1 } // ordenar por el campo "name" en orden ascendente
    }
  },
  {
    path: 'planner',
    select: 'startDate endDate duration schoolBlock content classObjectives evaluationIndicators evaluationIndicatorsTeacher learningObjectives  activities materials evaluationType otherMaterials createdAt updatedAt quiz workshop',
    populate: {
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
      path: 'byTeacher workshopId workshopClass',
      select: 'name lastName email name hubId'
    },
    

  },
{
  path: 'workshopHistory',
  populate: {
    path: 'workshopClass',
  },
    options: {
      sort: { 'createdAt': -1 }
    }
}


]



const workshopController = {

  createWorkshop: async (req, res) => {
    try {

      const newWorkshop = await new Workshops(req.body).save()

      if (newWorkshop) {

        res.status(200).json({
          response: newWorkshop,
          message: "Taller creado con exito",
          success: true
        })

      } else {
        res.status(404).json({
          message: "No se pudo crear el taller con exito",
          success: false
        })
      }
    } catch (error) {
      console.log(error)
      res.status(400).json({
        message: "Error al crear taller educativo",
        error: error,
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

      if (workshop.teacher.includes(teacherId)) {
        return res.status(200).json({
          message: 'El profesor ya se encuentra asignado a este taller',
          success: true
        });
      }

      // Agregar el nuevo id profesor al taller
      workshop.teacher.push(teacherId);

      // Guardar los cambios en la base de datos
      await workshop.save();

      const teacher = await Teachers.findById(teacherId)

      if (teacher.classroom.includes(workshopId)) {
        return res.status(400).json({
          message: 'Este taller ya está agregado al profesor',
          success: false
        });
      } else {
        teacher.workshop.push(workshopId);
        await teacher.save()
      }


      return res.status(200).json({
        message: 'Profesor agregado al taller con exito',
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
    let { id } = req.params;

    try {

      const workshopFund = await Workshops.findById(id).populate(workshopQueryPopulate)

      if (workshopFund) {
        res.status(200).json({
          response: workshopFund,
          success: true,
          message: "taller encontrado"
        })
      } else res.status(404).json({ message: "no se pudo encontrar el taller", success: false })

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
      console.log('[WORKSHOP ADD STUDENT] Agregando estudiante al taller:', { workshopId, studentId });
      
      const workshop = await Workshops.findById(workshopId);
      if (!workshop) {
        console.log('[WORKSHOP ADD STUDENT] Taller no encontrado:', workshopId);
        return res.status(404).json({
          message: 'Taller no encontrado',
          success: false
        });
      }

      workshop.students.push(studentId);
      await workshop.save();
      console.log('[WORKSHOP ADD STUDENT] Estudiante agregado al taller');
      
      const student = await Students.findById(studentId)

      if (student) {
        student.workshop.push(workshopId);
        await student.save()
        console.log('[WORKSHOP ADD STUDENT] Taller agregado al estudiante');
      }

      console.log('[WORKSHOP ADD STUDENT] Proceso completado exitosamente');
      return res.status(200).json({
        message: 'Estudiante agregado con exito al taller',
        success: true
      });

    } catch (error) {
      console.error('[WORKSHOP ADD STUDENT] Error:', error);
      return res.status(400).json({
        message: 'Error al agregar id de estudiante al taller',
        success: false
      });
    }
  },
  getWorkshopAll: async (req, res) => {
    try {
      const allWorkshops = await Workshops.find().populate(workshopQueryPopulate);


      if (allWorkshops) {
        res.status(200).json({
          message: 'Talleres encontrados',
          response: allWorkshops,
          success: true
        });
      } else {
        res.status(404).json({
          message: 'No se encontraron talleres disponibles',
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
  updateWorkshop: async (req, res) => {

    const { id } = req.params;
    const update = req.body;

    try {
      const updatedWorkshop = await Workshops.findByIdAndUpdate(id, update, { new: true })
      await updatedWorkshop.save()
      if (updatedWorkshop) {
        res.status(201).json({
          message: 'El taller ha sido actualizado correctamente',
          workshop: updatedWorkshop,
          success: true
        })
      } else {
        res.status(404).json({
          message: 'Taller no encontrado',
          success: false
        });
      }

    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al actualizar el taller',
        success: false
      });
    }
  },
  deleteWorkshop: async (req, res) => {

    try {

      const { id, programId } = req.params

      const program = await Programs.findById(programId)

      if (program) {

        let index = program.workshops.indexOf(id)

        program.workshops.splice(index, 1)

        await program.save()

        const deletedWorkshop = await Workshops.findByIdAndDelete(id)

        res.status(200).json({
          message: 'Taller eliminado con exito',
          success: true,
          response: deletedWorkshop
        });

      }

    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al eliminar el taller',
        success: false
      });
    }



  },
  removeStudentFromWorkshop: async (req, res) => {

    try {

      const { studentId, workshopId } = req.body
      const workshop = await Workshops.findById(workshopId)
      if (!workshop) {
        return res.status(404).json({
          message: 'Taller no encontrada',
          success: false
        });
      }
      const studentIndex = workshop.students.indexOf(studentId)
      if (studentIndex === -1) {
        return res.status(404).json({
          message: 'El Estudiante no se encuentra en el taller',
          success: false
        });
      }
      workshop.students.splice(studentIndex, 1)
      await workshop.save()
      const student = await Students.findById(studentId)
      if (!student) {
        return res.status(404).json({
          message: 'Estudiante no encontrado',
          success: false
        });
      }
      const workshopIndex = student.workshop.indexOf(workshopId)
      if (workshopIndex === -1) {
        return res.status(404).json({
          message: 'El Estudiante no se encuentra en el taller',
          success: false
        });
      }
      student.workshop.splice(workshopIndex, 1)
      await student.save()

      return res.status(200).json({
        message: 'Estudiante eliminado correctamente',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al eliminar el estudiante del taller',
        success: false
      });
    }

  },

  removeStudentWorkshop: async (req, res) => {

    const { studentId, workshopId } = req.body
    try {
      const workshop = await Workshops.findByIdAndUpdate(workshopId, { $pull: { students: studentId } }, { new: true })
      const student = await Students.findByIdAndUpdate(studentId, { $pull: { workshop: workshopId } }, { new: true })

      if (student) {
        res.status(200).json({
          message: "Estudiante y taller actualizados con exito",
          success: true,
          response: {
            student: student,
            workshop: workshop
          }
        })
      }


    } catch (error) {
      return res.status(404).json({
        message: 'Error al intentar eliminar el estudiante del taller',
        success: false
      });
    }


  }
}

module.exports = workshopController