const Institution = require('../models/institution')

const institutionPopulateQuery = [
  {
    path: 'teachers',
    select: 'name lastName email role rut logged',
  },
  {
    path: 'admins',
    select: 'name lastName email role rut logged',
  },
  {
    path: 'schools',
    populate: {
      path: 'admins',
      select: 'name lastName email role rut logged',
    },

  },
  {
    path: 'schools',
    populate: {
      path: 'classrooms',
      select: 'grade level planner classHistory',
      populate: {
        path: 'teacher teacherSubstitute',
        select: 'name lastName email role rut logged',
      },
    },
  },
    

  // },{
  //   path: 'schools',
  //   populate:{
  //     path: 'admins teachers students classrooms',
  //     populate:{
  //       path: 'classrooms',

  //     }
  //   }
  //   populate: {
  //     path: 'classrooms',
  //     select: 'grade level teacher teacherSubstitute students planner classHistory',
  //   },
  // }
];

const instiController = {

  createInstitution: async (req, res) => {

    try {

      const newInsti = await new Institution(req.body).save()

      if (newInsti) {
        res.status(201).json({
          response: newInsti,
          success: true
        })
      }

    } catch (error) {
      console.log(error)
      res.status(400).json({
        message: error.message,
        success: false
      });
    }

  },
  readInstitutions: async (req, res) => {
    try {
      // let allInstitutions = await Institution
      //   .find()
      //   .populate({
      //     path: 'teachers',
      //     select: 'name lastName email role rut logged',
      //   })
      //   .populate({
      //     path: 'admins',
      //     select: 'name lastName email role rut logged',
      //   })
      //   .populate({
      //     path: 'schools',
      //     populate: {
      //       path: 'admins',
      //       select: 'name lastName email role rut logged',}
      //   })
      //   .populate({
      //     path: 'schools',
      //     populate :{
      //       path: 'classrooms',
      //       select : 'grade level'
      //     }
      //   });

      const allInstitutions = await Institution.find().populate(institutionPopulateQuery);
  
      if (allInstitutions.length > 0) {
        res.status(200).json({
          message: 'Instituciones',
          response: allInstitutions,
          success: true,
        });
      } else {
        res.status(404).json({
          message: 'No hay instituciones',
          success: true,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al obtener instituciones',
        success: false,
      });
    }

  },
  addAdminToInstitution: async (req, res) => {
    try {

      const { institutionId, adminId } = req.body


      // Buscar la institución por su id
      const institution = await Institution.findById(institutionId);

      if (!institution) {
        return res.status(404).json({
          message: 'Institución no encontrada',
          success: false
        });
      }

      // Agregar el nuevo id de admin a la propiedad "admin" de la institución
      institution.admins.push(adminId);

      // Guardar los cambios en la base de datos
      await institution.save();

      return res.status(200).json({
        message: 'Id de admin agregado a la institución',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar id de admin a la institución',
        success: false
      });
    }
  },
  removeAdminFromInstitution: async (req, res) => {
    try {
      const { institutionId, adminId } = req.body

      // Buscar la institución por su id
      const institution = await Institution.findById(institutionId);

      if (!institution) {
        return res.status(404).json({
          message: 'Institución no encontrada',
          success: false
        });
      }

      // Encontrar el índice del id de admin en la propiedad "admin" de la institución
      const adminIndex = institution.admin.indexOf(adminId);

      if (adminIndex === -1) {
        return res.status(404).json({
          message: 'Admin no encontrado en la institución',
          success: false
        });
      }

      // Eliminar el id de admin de la propiedad "admin" de la institución
      institution.admins.splice(adminIndex, 1);

      // Guardar los cambios en la base de datos
      await institution.save();

      return res.status(200).json({
        message: 'Id de admin eliminado de la institución',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al eliminar id de admin de la institución',
        success: false
      });
    }
  },
  addTeacherToInstitution: async (req, res) => {
    try {

      const { institutionId, teacherId } = req.body


      // Buscar la institución por su id
      const institution = await Institution.findById(institutionId);

      if (!institution) {
        return res.status(404).json({
          message: 'Institución no encontrada',
          success: false
        });
      }

      // Agregar el nuevo id de admin a la propiedad "admin" de la institución
      institution.teachers.push(teacherId);

      // Guardar los cambios en la base de datos
      await institution.save();

      return res.status(200).json({
        message: 'Id de teacher agregado a la institución',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar id de teacher a la institución',
        success: false
      });
    }
  },
  addSchoolToInstitution: async (req, res) => {
    try {

      const { institutionId, schoolId } = req.body


      // Buscar la institución por su id
      const institution = await Institution.findById(institutionId);

      if (!institution) {
        return res.status(404).json({
          message: 'Institución no encontrada',
          success: false
        });
      }

      // Agregar el nuevo id de admin a la propiedad "admin" de la institución
      institution.schools.push(schoolId);

      // Guardar los cambios en la base de datos
      await institution.save();

      return res.status(200).json({
        message: 'Id de escuela agregado a la institución',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar id de escuela a la institución',
        success: false
      });
    }
  }



}


module.exports = instiController