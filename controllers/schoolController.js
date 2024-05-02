const Schools = require('../models/school')
const Students = require('../models/student')
const Teachers = require('../models/admin')


const institutionPopulateQuery = [
  {
    path: 'teachers',
    select: 'name lastName email role rut logged phone imgUrl',
    options: {
      sort: { 'lastName': 1 }
    }
  },
  {
    path: 'admins',
    select: 'name lastName email role rut logged phone imgUrl ',
  },
  {
    path: 'students',
    select: 'name lastName email role rut logged phone age weight size gender imgUrl classroom school grade',
    populate: {
      path: 'classroom school',
      select: 'grade level section name'
    },
    options: {
      sort: { 'lastName': 1 } // ordenar por el campo "name" en orden ascendente
    }
  },
  {
    path: 'classrooms',
    select: 'grade level planner classHistory student section',
    populate: {
      path: 'teacher teacherSubstitute students planner',
      select: 'name lastName email role rut logged phone age weight size gender date duration classObjetives learningObjectives  evaluationIndicators skills activities  materials evaluationType content'
    }
  },
  {
    path: 'institution',
    populate: {
      path: 'teachers',
      select: 'name lastName  _id'
    },
    options: {
      sort: { 'lastName': 1 }
    }
  },
  ,
  {
    path: 'workshops',
    select: 'name address phone email planner classHistory student ageRange days hours',
    populate: {
      path: 'teacher students planner',
      select: 'name lastName email role rut logged phone age weight size gender date duration classObjetives learningObjectives  evaluationIndicators skills activities  materials evaluationType content'
    }
  }
];



const schoolControllers = {

  createSchool: async (req, res) => {

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
  addWorkshopToSchool: async (req, res) => {
    try {

      const { schoolId, workshopId } = req.body


      // Buscar la institución por su id
      const school = await Schools.findById(schoolId);

      if (!school) {
        return res.status(404).json({
          message: 'Escuela no encontrada',
          success: false
        });
      }

      // Agregar el nuevo id de admin a la propiedad "classrooms" de la institución
      school.workshops.push(workshopId);

      // Guardar los cambios en la base de datos
      await school.save();

      return res.status(200).json({
        message: 'Taller agregado a la escuela con exito',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar taller a la Escuela',
        success: false
      });
    }
  },
  addTeacherToSchool: async (req, res) => {
    try {
      const { schoolId, teacherId } = req.body;

      // Buscar la institución por su id
      const school = await Schools.findById(schoolId);
      if (!school) {
        return res.status(404).json({
          message: 'Escuela no encontrada',
          success: false
        });
      }

      if (school.teachers.includes(teacherId)) {
        return res.status(200).json({
          message: 'El profesor ya se encuentra asignado a esta escuela',
          success: true
        });
      }
  

      // Agregar el teacherId al campo 'teachers' del objeto school
      school.teachers.push(teacherId);

      // Guardar la escuela actualizada
      await school.save();

      const teacher = await Teachers.findById(teacherId)
      if (teacher) {
        teacher.school.push(schoolId);
        await teacher.save()
      }
      return res.status(200).json({
        message: 'Profesor agregado a la Escuela con exito',
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

      const student = await Students.findById(studentId)
      if (student) {
        student.school.push(schoolId);
        await student.save()
      }
      return res.status(200).json({
        message: 'Estudiante agregado con exito a la Escuela',
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
  schoolById: async (req, res) => {

    let { id } = req.params;

    try {

      const schoolFund = await Schools.findById(id).populate(institutionPopulateQuery)


      if (schoolFund) {
        res.status(200).json({
          response: schoolFund,
          success: true,
          message: "Escuela encontrada"
        })
      } else res.status(404).json({ message: "no se pudo encontrar la escuela", success: false })


    } catch (error) {
      console.log(error)
      res.status(400).json({
        message: "Error al realizar peticion de busqueda de busqueda",
        success: false
      })
    }

  },
  getSchoolAll: async (req, res) => {
    try {
      const allSchools = await Schools.find().populate(institutionPopulateQuery);


      if (allSchools) {
        res.status(200).json({
          message: 'Escuelas encontradas',
          response: allSchools,
          success: true
        });
      } else {
        res.status(404).json({
          message: 'No se encontraron escuelas',
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
  deleteSchool: async (req, res) => {

    try {
      const { id } = req.params

      const deletedSchool = await Schools.findByIdAndDelete(id) 

      if (deletedSchool) {
        res.status(200).json({
          message: 'Escuela eliminada',
          success: true
        });
      } else {
        res.status(404).json({
          message: 'Escuela no encontrada',
          success: false
        });
      }

    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al eliminar escuela',
        success: false
      });
    }
  },
  updateSchool : async (req, res) => {
    const {id} = req.params;
    const update = req.body;
  
    try {
      // Actualizar la escuela y obtener el documento actualizado
      const updatedSchool = await Schools.findByIdAndUpdate(id, update, { new: true });

      await updatedSchool.save();

      if (updatedSchool) {
        res.status(200).json({
          message: 'Escuela actualizada',
          response: updatedSchool,
          success: true
        });
      } else {
        res.status(404).json({
          message: 'Escuela no encontrada',
          success: false
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al actualizar escuela',
        success: false
      });
    }
  }

}

module.exports = schoolControllers