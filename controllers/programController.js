const Programs = require('../models/program')
const Students = require('../models/student')

const programPopulateQuery = [
  {
    path: 'teachers',
    select: 'name lastName email role rut logged',
  },
  {
    path: 'admins',
    select: 'name lastName email role rut logged',
  },
  {
    path: 'students',
    select: 'name lastName email role rut logged phone age weight size gender imgUrl classroom school grade',
    populate: {
      path: 'workshops',
      select: 'name'
    },
    options: {
      sort: { lastName: 1 } // ordenar por el campo "name" en orden ascendente
    }
  },
  {
    path: 'workshops',
    select: 'name planner classHistory student',
    populate: {
      path: 'teacher teacherSubstitute students planner',
      select: 'name lastName email role rut logged phone age weight size gender date duration classObjetives learningObjectives  evaluationIndicators skills activities  materials evaluationType content'
    }
  }
];

const programControllers = {

  createProgram: async (req, res) => {

    try {
      const newProgram = await new Programs(req.body).save()

      if (newProgram) {
        res.status(200).json({
          message: "Programa creado con exito",
          response: newProgram,
          success: true
        })
      } else {
        res.status(404).json({
          message: "Error al crear programa",
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
  addAdminToProgram: async (req, res) => {
    try {

      const { programId, adminId } = req.body

      // Buscar el programa por su id
      const program = await Programs.findById(programId);

      if (!program) {
        return res.status(404).json({
          message: 'Programa no encontrado',
          success: false
        });
      }

      // Agregar el nuevo id de admin a la propiedad "admin" del programa
      program.admins.push(adminId);

      // Guardar los cambios en la base de datos
      await program.save();

      return res.status(200).json({
        message: 'Id de admin agregado al programa',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar id de admin al programa',
        success: false
      });
    }
  },
  removeAdminFromProgram: async (req, res) => {
    try {
      const { programId, adminId } = req.body

      // Buscar la institución por su id
      const program = await Programs.findById(schoolId);

      if (!program) {
        return res.status(404).json({
          message: 'Programa no encontrado',
          success: false
        });
      }

      // Encontrar el índice del id de admin en la propiedad "admin" del programa
      const adminIndex = program.admins.indexOf(adminId);

      if (adminIndex === -1) {
        return res.status(404).json({
          message: 'Admin no encontrado en el programa',
          success: false
        });
      }

      // Eliminar el id de admin de la propiedad "admin" del programa
      program.admins.splice(adminIndex, 1);

      // Guardar los cambios en la base de datos
      await program.save();

      return res.status(200).json({
        message: 'Id de admin eliminado del programa',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al eliminar id de admin del programa',
        success: false
      });
    }
  },
  addWorkshopToProgram: async (req, res) => {
    try {

      const { programId, workshopId } = req.body

      // Buscar el programa por su id
      const program = await Programs.findById(programId);

      if (!program) {
        return res.status(404).json({
          message: 'Programa no encontrado',
          success: false
        });
      }

      // Agregar el nuevo id de admin a la propiedad "Workshops" del programa
      program.workshops.push(workshopId);

      // Guardar los cambios en la base de datos
      await program.save();

      return res.status(200).json({
        message: 'Id del taller agregado al programa con exito',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar id del taller al programa',
        success: false
      });
    }
  },
  addTeacherToProgram: async (req, res) => {
    try {
      const { programId, teacherId } = req.body
      // Buscar la institución por su id
      const program = await Programs.findById(programId);
      if (!program) {
        return res.status(404).json({
          message: 'Programa no encontrado',
          success: false
        });
      }

      program.teachers.push(teacherId);
      await program.save();

      return res.status(200).json({
        message: 'Id de profesor agregado al Programa',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar id de profesor al programa',
        success: false
      });
    }
  },
  addStudentToProgram: async (req, res) => {
    try {
      const { programId, studentId } = req.body
      const program = await Programs.findById(programId);
      if (!program) {
        return res.status(404).json({
          message: 'Programa no encontrado',
          success: false
        });
      }

      program.students.push(studentId);
      await program.save();

      const student = await Students.findById(studentId)

      if (student) {
        student.programs.push(programId);
        await student.save()
      }

      return res.status(200).json({
        message: 'Estudiante agregado con exito al programa',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar id de estudiante al programa',
        success: false
      });
    }
  },
  programById: async (req, res) => {

    let { id } = req.params;

    try {
      const programFund = await Programs.findById(id).populate(programPopulateQuery)

      if (programFund) {
        res.status(200).json({
          response: programFund,
          success: true,
          message: "Programa encontrado"
        })
      } else res.status(404).json({ message: "no se pudo encontrar al programa", success: false })


    } catch (error) {
      console.log(error)
      res.status(400).json({
        message: "Error al realizar peticion de busqueda de busqueda de programa",
        success: false
      })
    }

  }

}

module.exports = programControllers