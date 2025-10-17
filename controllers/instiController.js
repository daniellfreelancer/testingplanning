const Institution = require('../models/institution')
const Schools = require('../models/school')
const Programs = require('../models/program')
const Admins = require('../models/admin');
const { default: mongoose } = require('mongoose');


const institutionPopulateQuery = [
  {
    path: 'teachers',
    select: 'name lastName email role rut logged imgUrl phone',
    options: {
      sort: { 'lastName': 1 }
    }
  },
  {
    path: 'admins',
    select: 'name lastName email role rut logged',
  },
  {
    path: 'schools',
    populate: {
      path: 'admins teachers students',
      select: 'name lastName email role rut logged phone age weight size gender',
      options: {
        sort: { lastName: 1 } // ordenar por el campo "name" en orden ascendente
      }
    },
  },
  {
    path: 'schools',
    populate: {
      path: 'classrooms',
      select: 'grade level planner classHistory students',
      populate: {
        path: 'teacher teacherSubstitute planner',
        select: 'name lastName email role rut logged date duration classObjectives learningObjectives evaluationIndicators classroom  skills activities materials evaluationType content',
      },
    },
  },
  {
    path: 'schools',
    populate: {
      path: 'classrooms students',
      select: 'name lastName email role rut logged phone age weight size gender',
      options: {
        sort: { name: 1 } // ordenar por el campo "name" en orden ascendente
      }
    }
  },
  {
    path: 'programs',
    populate: {
      path: 'admins teachers workshops students'
    }
  },
  {
    path: 'clubs',
    options: {
      sort: { 'name': 1 }
    }
  },
  {
    path: 'director adminsOffice',
  }

];

const studentsPopulate = [
  {
    path: 'schools programs',
    populate: {
      path: 'students',
      select: 'name lastName email rut phone age weight size gender',
      options: {
        collation: { locale: 'es', strength: 2 },
        sort: { name: 1 }
      }
    }
  },
  // {
  //   path: 'programs',
  //   populate: {
  //     path: 'workshops students',
  //     select: 'name lastName email rut phone age weight size gender',
  //     options: {
  //       collation: { locale: 'es', strength: 2 },
  //       sort: { name: 1 }
  //     }
  //   }
  // },
]


const instiController = {

  // createInstitution: async (req, res) => {

  //   try {

  //     const {
  //       admins
  //     } = req.body

  //     const newInsti = await new Institution(req.body).save()

  //     if (newInsti) {

  //       let idInstitution = newInsti._id;
  //       let idAdmin = admins;
  //       let admin = await Admins.findById(idAdmin)
  //       admin.institution = idInstitution
  //       admin.save()

  //       res.status(201).json({
  //         response: newInsti,
  //         success: true,
  //         message: "La institución ha sido creada con exito"
  //       })
  //     }

  //   } catch (error) {
  //     console.log(error)
  //     res.status(400).json({
  //       message: error.message,
  //       success: false
  //     });
  //   }

  // },
  createInstitution: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { name, address, email, phone, rut, type, admins = [] } = req.body;

        // Validación básica
        if (!name || !address || !email || !phone || !rut || !type) {
            return res.status(400).json({
                success: false,
                message: "Faltan campos requeridos: name, address, email, phone, rut, type"
            });
        }

        // Crear la institución
        const newInsti = await new Institution({
            ...req.body,
            admins: Array.isArray(admins) ? admins : [admins].filter(Boolean)
        }).save({ session });

        if (!newInsti) {
            throw new Error("Error al crear la institución");
        }

        // Actualizar los admins (si se proporcionaron)
        if (admins && admins.length > 0) {
            const adminIds = Array.isArray(admins) ? admins : [admins];
            
            await Promise.all(adminIds.map(async (adminId) => {
                const admin = await Admins.findById(adminId).session(session);
                if (!admin) {
                    throw new Error(`Admin con ID ${adminId} no encontrado`);
                }
                admin.institution = newInsti._id;
                await admin.save({ session });
            }));
        }

        await session.commitTransaction();
        
        res.status(201).json({
            success: true,
            data: newInsti,
            message: "Institución creada exitosamente"
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Error en createInstitution:", error);
        
        const statusCode = error.message.includes("no encontrado") ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Error al crear la institución"
        });
    } finally {
        session.endSession();
    }
},
  readInstitutions: async (req, res) => {
    try {
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

      const school = await Schools.findById(schoolId)

      if (!school) {
        return res.status(404).json({
          message: 'Escuela no encontrada',
          success: false
        })
      }

      school.institution.push(institutionId)
      await school.save()

      return res.status(201).json({
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
  },
  addProgramToInstitution: async (req, res) => {
    try {

      const { institutionId, programId } = req.body

      // Buscar la institución por su id
      const institution = await Institution.findById(institutionId);

      if (!institution) {
        return res.status(404).json({
          message: 'Institución no encontrada',
          success: false
        });
      }
      // Agregar el nuevo id de admin a la propiedad "admin" de la institución
      institution.programs.push(programId);

      // Guardar los cambios en la base de datos
      await institution.save();

      const program = await Programs.findById(programId)

      if (!program) {
        return res.status(404).json({
          message: 'Programa no encontrado',
          success: false
        });
      }

      program.institution.push(institutionId)

      await program.save()

      return res.status(200).json({
        message: 'Id del programa agregado a la institución',
        success: true
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: 'Error al agregar id del programa a la institución',
        success: false
      });
    }
  },
  institutionById: async (req, res) => {
    let { id } = req.params;
    try {

      const instiFund = await Institution.findById(id).populate(institutionPopulateQuery);

      if (instiFund) {

        res.status(200).json({
          response: instiFund,
          success: true,
          message: "Institucion encontrada"
        })

      } else res.status(404).json({ message: "no se pudo encontrar la institución", success: false })

    } catch (error) {
      console.log(error)
      res.status(400).json({
        message: "Error al realizar peticion de busqueda de institución",
        success: false
      })
    }


  },
  deleteInstitution: async (req, res) => {

    try {
      const { id } = req.params

      const deletedInstitution = await Institution.findByIdAndDelete(id)



      if (deletedInstitution) {
        res.status(200).json({
          message: 'Institución eliminada',
          success: true
        });
      } else {
        res.status(404).json({
          message: 'Institución no encontrada',
          success: false
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al eliminar institución',
        success: false
      });
    }
  },
  updateInstitution: async (req, res) => {
    const _id = req.params.id;
    const update = req.body;

    try {
      // Actualiza directamente sin necesidad de llamar a save()
      const updatedInstitution = await Institution.findByIdAndUpdate(
        _id,
        update,
        { new: true, runValidators: true } // Opciones para retornar el documento actualizado y ejecutar validadores
      );

      if (updatedInstitution) {
        res.status(200).json({
          message: 'Institución actualizada',
          response: updatedInstitution,
          success: true
        });
      } else {
        res.status(404).json({
          message: 'Institución no encontrada',
          success: false
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al actualizar institución',
        success: false
      });
    }
  },
  addSubscriptions: async (req, res) => {
    try {
      const { id } = req.params
      const { subscriptions } = req.body

      const institution = await Institution.findByIdAndUpdate(id, { $push: { subscriptions } }, { new: true })

      if (institution) {
        res.status(201).json({
          message: 'Suscripciones agregadas exitosamente',
          data: institution,
          success: true
        })
      } else {
        res.status(404).json({
          message: 'Institución no encontrada',
          success: false
        })
      }
    } catch (error) {
      console.log(error)
      res.status(400).json({
        message: 'Hubo un error al agregar suscripciones',
        success: false
      })
    }
  },
  removeSubscriptions: async (req, res) => {
    try {
      const { id } = req.params
      const { subscriptions } = req.body

      const institution = await Institution.findByIdAndUpdate(id, { $pull: { subscriptions } }, { new: true })

      if (institution) {
        res.status(200).json({
          message: 'Suscripciones eliminadas exitosamente',
          data:institution,
          success: true
        })
      } else {
        res.status(404).json({
          message: 'Institución no encontrada',
          success: false
        })
      }
    } catch (error) {
      console.log(error)
      res.status(400).json({
        message: 'Hubo un error al eliminar suscripciones',
        success: false
      })
    }
  },
  getStudentsByInstitution: async (req, res) => {
    let { id } = req.params;

    try {
      // Busca la institución por ID y realiza el query populate
      const institution = await Institution.findById(id).populate(studentsPopulate);

      if (!institution) {
        return res.status(404).json({
          message: "No se pudo encontrar la institución",
          success: false
        });
      }

      // Inicializar un array para acumular todos los estudiantes
      let students = [];

      // Iterar sobre las escuelas de la institución
      institution.schools.forEach(school => {
        // Agregar los estudiantes de cada escuela
        if (school.students) {
          students.push(...school.students);
        }

        // Iterar sobre las aulas y agregar los estudiantes de cada aula
        // if (school.classrooms) {
        //     school.classrooms.forEach(classroom => {
        //         if (classroom.students) {
        //             students.push(...classroom.students);
        //         }
        //     });
        // }
      });

      // Iterar sobre los programas de la institución
      institution.programs.forEach(program => {
        if (program.students) {
          students.push(...program.students);
        }
      });

      // Eliminar duplicados usando el campo '_id' de cada estudiante
      let uniqueStudents = [...new Map(students.map(student => [student._id.toString(), student])).values()];

      // Ordenar de forma insensible a mayúsculas y minúsculas por el campo "name"
      uniqueStudents.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

      // Responder con el array de estudiantes únicos
      res.status(200).json({
        message: "Estudiantes obtenidos con éxito",
        data: uniqueStudents,
        success: true
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al obtener estudiantes de la institución",
        success: false
      });
    }
  }

}


module.exports = instiController