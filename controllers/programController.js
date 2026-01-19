const Programs = require('../models/program')
const Students = require('../models/student')
const Teachers = require('../models/admin')
const Institution = require('../models/institution')
const mongoose = require('mongoose')
const { uploadMulterFile } = require('../utils/s3Client')

const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

// helper: si imgUrl es un key antiguo, lo convierte a URL de CloudFront (si está configurado)
function attachCloudFrontUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (!cloudfrontUrl) return url;
  return `${cloudfrontUrl}/${url}`;
}

const programPopulateQuery = [
  {
    path: 'teachers',
    select: 'name lastName email role rut logged phone imgUrl',
    options: {
      sort: { 'lastName': 1 }
    }
  },
  {
    path: 'admins',
    select: 'name lastName email role rut logged',
  },
  {
    path: 'students',
    select: 'name lastName email role rut logged phone age weight size gender imgUrl classroom school grade',
    populate: {
      path: 'workshop',
      select: 'name'
    },
    options: {
      sort: { lastName: 1 } // ordenar por el campo "name" en orden ascendente
    }
  },
  {
    path: 'workshops',
    select: 'name address phone email planner classHistory student ageRange days hours',
    populate: {
      path: 'teacher students planner',
      select: 'name lastName email role rut logged phone age weight size gender date duration classObjetives learningObjectives  evaluationIndicators skills activities  materials evaluationType content'
    }
  },
  {
    path: 'institution',
    select: 'name address phone email type',
  }
];

const studentsPopulateQuery = [
  {
    path: 'students',
    select: 'name lastName email role rut logged phone age weight size gender imgUrl classroom school grade',
    populate: {
      path: 'workshop',
      select: 'name'
    },
    options: {
      sort: { lastName: 1 } // ordenar por el campo "name" en orden ascendente
    }
  },
];

const teachersPopulateQuery = [
  {
    path: 'teachers',
    select: 'name lastName email role rut logged phone gender imgUrl',
    populate: {
      path: 'workshop',
      select: 'name'
    },
    options: {
      sort: { lastName: 1 } // ordenar por el campo "name" en orden ascendente
    }
  },
];
const programControllers = {

  createProgram: async (req, res) => {

    try {
      const institutionIdFromParams = req.params?.institutionId;
      const institutionId = institutionIdFromParams || req.body?.institution;

      if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) {
        return res.status(400).json({
          message: 'institutionId inválido',
          success: false
        })
      }

      const institution = await Institution.findById(institutionId).select('_id programs')
      if (!institution) {
        return res.status(404).json({
          message: 'Institución no encontrada',
          success: false
        })
      }

      const newProgram = new Programs({
        ...req.body,
        institution: institutionId
      })

      // ⬇️ Subir foto del programa a S3 (opcional)
      if (req.file) {
        const key = await uploadMulterFile(req.file);
        // Guardamos la URL completa de CloudFront (mismo patrón que Student/Post/Moment)
        newProgram.imgUrl = cloudfrontUrl ? `${cloudfrontUrl}/${key}` : key;
      }

      await newProgram.save()

      // Agregar el programa a la institución
      await Institution.updateOne(
        { _id: institutionId },
        { $addToSet: { programs: newProgram._id } }
      )

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

      if (program.teachers.includes(teacherId)) {
        return res.status(200).json({
          message: 'El profesor ya se encuentra asignado a este programa',
          success: true
        });
      }



      program.teachers.push(teacherId);
      await program.save();

      const teacher = await Teachers.findById(teacherId)
      if (teacher) {
        teacher.program.push(programId);
        await teacher.save()
      }

      return res.status(200).json({
        message: 'Profesor agregado al Programa con exito',
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
      console.log('[PROGRAM ADD STUDENT] Agregando estudiante al programa:', { programId, studentId });
      
      const program = await Programs.findById(programId);
      if (!program) {
        console.log('[PROGRAM ADD STUDENT] Programa no encontrado:', programId);
        return res.status(404).json({
          message: 'Programa no encontrado',
          success: false
        });
      }

      program.students.push(studentId);
      await program.save();
      console.log('[PROGRAM ADD STUDENT] Estudiante agregado al programa');

      const student = await Students.findById(studentId)

      if (student) {
        student.program.push(programId);
        await student.save()
        console.log('[PROGRAM ADD STUDENT] Programa agregado al estudiante');
      }

      console.log('[PROGRAM ADD STUDENT] Proceso completado exitosamente');
      return res.status(200).json({
        message: 'Estudiante agregado con exito al programa',
        success: true
      });

    } catch (error) {
      console.error('[PROGRAM ADD STUDENT] Error:', error);
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

  },
  getProgramAll: async (req, res) => {
    try {
      const allPrograms = await Programs.find().populate(programPopulateQuery);


      if (allPrograms) {
        res.status(200).json({
          message: 'Programas encontrados',
          response: allPrograms,
          success: true
        });
      } else {
        res.status(404).json({
          message: 'No se encontraron programas disponibles',
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
  deleteProgram: async (req, res) => {

    try {
      const { id } = req.params

      const deletedProgram = await Programs.findByIdAndDelete(id) 

      if (deletedProgram) {
        res.status(200).json({
          message: 'Programa eliminado',
          success: true
        });
      } else {
        res.status(404).json({
          message: 'Programa no encontrado',
          success: false
        });
      }

    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al eliminar programa',
        success: false
      });
    }
  },
  updateProgram : async (req, res) => {
    const {id} = req.params;
    const update = req.body;
  
    try {
      // Actualizar la escuela y obtener el documento actualizado
      const updatedProgram = await Programs.findByIdAndUpdate(id, update, { new: true });

      await updatedProgram.save();

      if (updatedProgram) {
        res.status(200).json({
          message: 'Programa actualizado',
          response: updatedProgram,
          success: true
        });
      } else {
        res.status(404).json({
          message: 'Programa no encontrado',
          success: false
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al actualizar programa',
        success: false
      });
    }
  },
  getProgramByInstitution: async (req, res) => {
    try {
      const { institutionId } = req.params;

      // Traer todos los programas de la institución y popular según el schema
      const programs = await Programs.find({ institution: institutionId }).populate(programPopulateQuery);

      if (programs) {
        return res.status(200).json({
          message: 'Programas encontrados',
          response: programs,
          success: true
        });
      }

      return res.status(404).json({
        message: 'No se encontraron programas para esta institución',
        success: false
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'Error en el servidor',
        success: false
      });
    }
  },
  getProgramByInstitutionFutbolType: async (req, res) => {

    try {

      const institutions = await Institution.find({ type: 'futbol' }).select('_id');
      const institutionIds = (institutions || []).map(i => i._id);

      if (institutionIds.length === 0) {
        return res.status(200).json({
          message: 'No hay instituciones tipo futbol',
          response: [],
          success: true
        });
      }

/**
 * retornar los programas de las instituciones, con los siguientes campos:
 * _id, name, address, email, phone,  imgUrl,
 * workshops: [array de objetos con los siguientes campos: _id, name]
 */

      const programs = await Programs.find({ institution: { $in: institutionIds } })
        .select('_id name address email phone imgUrl workshops')
        .populate({
          path: 'workshops',
          select: '_id name ageStart ageEnd',
        })
        .lean();

      const programsResponse = (programs || []).map(p => ({
        _id: p._id,
        name: p.name,
        address: p.address,
        email: p.email,
        phone: p.phone,
        imgUrl: attachCloudFrontUrl(p.imgUrl),
        workshops: Array.isArray(p.workshops)
          ? p.workshops.map(w => ({ _id: w?._id, name: w?.name, ageStart: w?.ageStart, ageEnd: w?.ageEnd }))
          : []
      }));

      return res.status(200).json({
        message: 'Programas encontrados',
        response: programsResponse,
        success: true
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'Error en el servidor',
        success: false
      });
    }
  },
  getStudentsProgramByInstitution: async (req, res) => {
    try {
      const { institutionId } = req.params;

      // Traer todos los programas de la institución y popular según el schema
      const programs = await Programs.find({ institution: institutionId })
      .populate(studentsPopulateQuery).select('students name',);

      if (programs) {
        return res.status(200).json({
          message: 'Programas encontrados',
          response: programs,
          success: true
        });
      }

      return res.status(404).json({
        message: 'No se encontraron programas para esta institución',
        success: false
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'Error en el servidor',
        success: false
      });
    }
  },
  getTeachersProgramByInstitution: async (req, res) => {
    try {
      const { institutionId } = req.params;
      const programs = await Programs.find({ institution: institutionId })
      .populate(teachersPopulateQuery).select('teachers name',);


      if (programs) {
        return res.status(200).json({
          message: 'Programas encontrados',
          response: programs,
          success: true
        });
      }

      return res.status(404).json({
        message: 'No se encontraron programas para esta institución',
        success: false
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'Error en el servidor',
        success: false
      });
    }
  },
}

module.exports = programControllers