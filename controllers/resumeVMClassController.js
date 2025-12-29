const ResumeVmClass = require('../models/resumeVMclass');
const ClassRoom = require('../models/classroom');
const Workshop = require('../models/workshop');
const Survey = require('../models/survey');

// nuevo helper centralizado VMCLASS
const {
  uploadMulterFileVmclass,
} = require('../utils/s3ClientVMclass');

const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

const resumeQueryPopulate = [
  {
    path: 'byTeacher plannerClass',
  },
];

// helper para obtener URL de las imágenes del resumen
// Si ya es una URL completa (CloudFront), la devuelve tal cual
// Si es un key antiguo, genera la URL de CloudFront
function attachCloudFrontUrls(resumeDoc) {
  if (!resumeDoc) return resumeDoc;

  const plain = resumeDoc.toObject ? resumeDoc.toObject() : resumeDoc;

  try {
    // Procesar imgFirstVMClass
    if (plain.imgFirstVMClass) {
      if (!plain.imgFirstVMClass.startsWith('http://') && !plain.imgFirstVMClass.startsWith('https://')) {
        plain.imgFirstVMClass = `${cloudfrontUrl}/${plain.imgFirstVMClass}`;
      }
    }

    // Procesar imgSecondVMClass
    if (plain.imgSecondVMClass) {
      if (!plain.imgSecondVMClass.startsWith('http://') && !plain.imgSecondVMClass.startsWith('https://')) {
        plain.imgSecondVMClass = `${cloudfrontUrl}/${plain.imgSecondVMClass}`;
      }
    }

    // Procesar imgThirdVMClass
    if (plain.imgThirdVMClass) {
      if (!plain.imgThirdVMClass.startsWith('http://') && !plain.imgThirdVMClass.startsWith('https://')) {
        plain.imgThirdVMClass = `${cloudfrontUrl}/${plain.imgThirdVMClass}`;
      }
    }
  } catch (err) {
    console.error('Error generando URLs para imágenes del resumen:', err);
  }

  return plain;
}

const createSurveysForStudents = async (resumeId, arrayStudentsForSurvey, classroomId) => {
  const surveys = [];
  let status = false;

  let sleepLevel = 0;
  let stressLevel = 0;
  let fatigueLevel = 0;
  let muscleLevel = 0;
  let moodLevel = 0;

  for (const studentId of arrayStudentsForSurvey) {
    if (studentId.attendance == 'true') {
      const newSurvey = new Survey({
        classroom: classroomId,
        vmClass: resumeId,
        student: studentId,
        sleepLevel,
        stressLevel,
        fatigueLevel,
        muscleLevel,
        moodLevel,
        status,
      });

      surveys.push(newSurvey);
    }
  }

  await Survey.insertMany(surveys);
};

const createSurveysForStudentsWorkshop = async (resumeId, arrayStudentsForSurvey, workshopId) => {
  const surveys = [];
  let status = false;

  let sleepLevel = 0;
  let stressLevel = 0;
  let fatigueLevel = 0;
  let muscleLevel = 0;
  let moodLevel = 0;

  for (const studentId of arrayStudentsForSurvey) {
    if (studentId.attendance == 'true') {
      const newSurvey = new Survey({
        workshop: workshopId,
        vmClass: resumeId,
        student: studentId,
        sleepLevel,
        stressLevel,
        fatigueLevel,
        muscleLevel,
        moodLevel,
        status,
      });

      surveys.push(newSurvey);
    }
  }

  await Survey.insertMany(surveys);
};

const resumeVMClassController = {
  createResume: async (req, res) => {
    try {
      const {
        imgFirstVMClass,
        imgSecondVMClass,
        imgThirdVMClass,
        byTeacher,
        plannerClass,
        elapsedClassTime,
        startClassTime,
        endClassTime,
        extraActivities,
        presentStudents,
        evaluationNotation,
        observationsClass,
        plannerNoClass,
        classroomId,
        workshopClass,
        workshopId,
      } = req.body;

      const resume = new ResumeVmClass({
        imgFirstVMClass,
        imgSecondVMClass,
        imgThirdVMClass,
        byTeacher,
        plannerClass,
        elapsedClassTime,
        startClassTime,
        endClassTime,
        extraActivities,
        presentStudents,
        evaluationNotation,
        observationsClass,
        plannerNoClass,
        classroomId,
        workshopClass,
        workshopId,
      });

      // ⬇️ Subidas a S3 (VMCLASS) usando el helper

      if (req.files && req.files['imgFirstVMClass']?.[0]) {
        const file = req.files['imgFirstVMClass'][0];
        const key = await uploadMulterFileVmclass(file);
        // Generamos la URL de CloudFront
        resume.imgFirstVMClass = `${cloudfrontUrl}/${key}`;
      }

      if (req.files && req.files['imgSecondVMClass']?.[0]) {
        const file = req.files['imgSecondVMClass'][0];
        const key = await uploadMulterFileVmclass(file);
        // Generamos la URL de CloudFront
        resume.imgSecondVMClass = `${cloudfrontUrl}/${key}`;
      }

      if (req.files && req.files['imgThirdVMClass']?.[0]) {
        const file = req.files['imgThirdVMClass'][0];
        const key = await uploadMulterFileVmclass(file);
        // Generamos la URL de CloudFront
        resume.imgThirdVMClass = `${cloudfrontUrl}/${key}`;
      }

      // Guardar resumen
      await resume.save();

      const resumeId = resume._id;
      const arrayStudentsForSurvey = resume.presentStudents;

      // Aplicar URLs de CloudFront al resumen antes de devolverlo
      const resumeWithUrls = attachCloudFrontUrls(resume);

      try {
        if (req.body.classroomId) {
          const classroom = await ClassRoom.findById(req.body.classroomId);
          if (classroom) {
            classroom.classHistory.push(resumeId);
            await classroom.save();

            await createSurveysForStudents(
              resumeId,
              arrayStudentsForSurvey,
              req.body.classroomId
            );

            return res.status(200).json({
              message: 'VMClass Finalizado con exito',
              success: true,
              response: resumeWithUrls,
            });
          }
        }

        if (req.body.workshopId) {
          const workshop = await Workshop.findById(req.body.workshopId);

          if (workshop) {
            workshop.workshopHistory.push(resumeId);
            await workshop.save();

            await createSurveysForStudentsWorkshop(
              resumeId,
              arrayStudentsForSurvey,
              req.body.workshopId
            );

            return res.status(200).json({
              message: 'VMClass Finalizado con exito',
              success: true,
              response: resumeWithUrls,
            });
          }
        }

        // Si no vino ni classroomId ni workshopId
        return res.status(200).json({
          message: 'VMClass creado (sin classroom/workshop asociado)',
          success: true,
          response: resumeWithUrls,
        });
      } catch (error) {
        console.log(error);
        return res.status(500).send({
          message: 'Error al guardar el VMClass en la base de datos.',
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to add Resume VM' });
    }
  },

  getResume: async (req, res) => {
    try {
      let resumes = await ResumeVmClass.find()
        .populate('byTeacher', { name: 1, lastName: 1 })
        .populate('plannerClass')
        .populate('classroomId', { grade: 1, level: 1, section: 1 });

      // Aplicar URLs de CloudFront a todos los resúmenes
      resumes = resumes.map(resume => attachCloudFrontUrls(resume));

      res.status(200).json(resumes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch resumes' });
    }
  },

  getResumeByClassroom: async (req, res) => {
    const { classroomId } = req.params;

    try {
      let resumes = await ResumeVmClass.find({ classroomId })
        .populate('plannerClass')
        .sort({ createdAt: -1 })
        .exec();

      // Aplicar URLs de CloudFront a todos los resúmenes
      resumes = resumes.map(resume => attachCloudFrontUrls(resume));

      res.json(resumes);
    } catch (error) {
      console.error('Error al buscar resúmenes:', error);
      res.status(500).json({ error: 'Error al buscar resúmenes' });
    }
  },

  getResumeById: async (req, res) => {
    let { id } = req.params;

    try {
      let resumeFund = await ResumeVmClass.findById(id)
        .populate('byTeacher', { name: 1, lastName: 1 })
        .populate('plannerClass')
        .populate('classroomId', { grade: 1, section: 1, level: 1 });

      if (resumeFund) {
        if (
          Array.isArray(resumeFund.presentStudents) &&
          typeof resumeFund.presentStudents[0] === 'string'
        ) {
          resumeFund.presentStudents = resumeFund.presentStudents.map((student) =>
            JSON.parse(student)
          );
        }

        // Aplicar URLs de CloudFront
        resumeFund = attachCloudFrontUrls(resumeFund);

        res.status(200).json({
          response: resumeFund,
          success: true,
          message: 'Resumen VMClass encontrado',
        });
      } else {
        res.status(404).json({
          message: 'no se pudo encontrar Resumen VMClass',
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al realizar peticion de busqueda de busqueda',
        success: false,
      });
    }
  },

  getResumeByTeacher: async (req, res) => {
    try {
      const { teacherId } = req.params;

      let resumes = await ResumeVmClass.find({ byTeacher: teacherId }).sort({
        createdAt: -1,
      });

      // Aplicar URLs de CloudFront a todos los resúmenes
      resumes = resumes.map(resume => attachCloudFrontUrls(resume));

      if (resumes.length > 0) {
        res.status(200).json({
          response: resumes,
          success: true,
          message: 'Resumen VMClass encontrados',
        });
      } else {
        res.status(200).json({
          message: 'El profesor no ha realizado clases',
          success: true,
          response: [],
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al realizar peticion de busqueda de busqueda',
        success: false,
      });
    }
  },
};

module.exports = resumeVMClassController;
