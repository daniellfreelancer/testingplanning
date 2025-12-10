const ResumeVmClass = require('../models/resumeVMclass');
const ClassRoom = require('../models/classroom');
const Workshop = require('../models/workshop');
const Survey = require('../models/survey');

// nuevo helper centralizado VMCLASS
const {
  uploadMulterFileVmclass,
} = require('../utils/s3ClientVMclass');

const resumeQueryPopulate = [
  {
    path: 'byTeacher plannerClass',
  },
];

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
        resume.imgFirstVMClass = key;
      }

      if (req.files && req.files['imgSecondVMClass']?.[0]) {
        const file = req.files['imgSecondVMClass'][0];
        const key = await uploadMulterFileVmclass(file);
        resume.imgSecondVMClass = key;
      }

      if (req.files && req.files['imgThirdVMClass']?.[0]) {
        const file = req.files['imgThirdVMClass'][0];
        const key = await uploadMulterFileVmclass(file);
        resume.imgThirdVMClass = key;
      }

      // Guardar resumen
      await resume.save();

      const resumeId = resume._id;
      const arrayStudentsForSurvey = resume.presentStudents;

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
              response: resume,
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
              response: resume,
            });
          }
        }

        // Si no vino ni classroomId ni workshopId
        return res.status(200).json({
          message: 'VMClass creado (sin classroom/workshop asociado)',
          success: true,
          response: resume,
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
      const resumes = await ResumeVmClass.find()
        .populate('byTeacher', { name: 1, lastName: 1 })
        .populate('plannerClass')
        .populate('classroomId', { grade: 1, level: 1, section: 1 });

      res.status(200).json(resumes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch resumes' });
    }
  },

  getResumeByClassroom: async (req, res) => {
    const { classroomId } = req.params;

    try {
      const resumes = await ResumeVmClass.find({ classroomId })
        .populate('plannerClass')
        .sort({ createdAt: -1 })
        .exec();

      res.json(resumes);
    } catch (error) {
      console.error('Error al buscar resúmenes:', error);
      res.status(500).json({ error: 'Error al buscar resúmenes' });
    }
  },

  getResumeById: async (req, res) => {
    let { id } = req.params;

    try {
      const resumeFund = await ResumeVmClass.findById(id)
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

      const resumes = await ResumeVmClass.find({ byTeacher: teacherId }).sort({
        createdAt: -1,
      });

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
