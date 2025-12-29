const ResumeVmClass = require("../models/resumeVmTraining");
const SportCategory = require("../models/sportCategory");
const SportPlanification = require("../models/sportPlanification");
const User = require("../models/admin");
const Survey = require("../models/survey");

// ✅ helper centralizado para VMCLASS
const {
  uploadMulterFileVmclass,
} = require("../utils/s3ClientVMclass");

const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

// helper para obtener URL de las imágenes del resumen de entrenamiento
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
    console.error('Error generando URLs para imágenes del resumen de entrenamiento:', err);
  }

  return plain;
}

const createSurveysForPlayers = async (
  resumeId,
  arrayStudentsForSurvey,
  sportCategoryId
) => {
  const surveys = [];
  let status = false;
  let sleepLevel = 0;
  let stressLevel = 0;
  let fatigueLevel = 0;
  let muscleLevel = 0;
  let moodLevel = 0;

  for (const studentId of arrayStudentsForSurvey) {
    if (studentId.attendance == "true") {
      const newSurvey = new Survey({
        sportResume: resumeId,
        sportCategory: sportCategoryId,
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

const resumeVMTrainingController = {
  createResumeTraining: async (req, res) => {
    try {
      const resumeTraining = new ResumeVmClass(req.body);

      // ⬇️ IMÁGENES A S3 (VMCLASS) CON EL HELPER

      if (req.files && req.files["imgFirstVMClass"]?.[0]) {
        const file = req.files["imgFirstVMClass"][0];
        const key = await uploadMulterFileVmclass(file);
        // Generamos la URL de CloudFront
        resumeTraining.imgFirstVMClass = `${cloudfrontUrl}/${key}`;
      }

      if (req.files && req.files["imgSecondVMClass"]?.[0]) {
        const file = req.files["imgSecondVMClass"][0];
        const key = await uploadMulterFileVmclass(file);
        // Generamos la URL de CloudFront
        resumeTraining.imgSecondVMClass = `${cloudfrontUrl}/${key}`;
      }

      if (req.files && req.files["imgThirdVMClass"]?.[0]) {
        const file = req.files["imgThirdVMClass"][0];
        const key = await uploadMulterFileVmclass(file);
        // Generamos la URL de CloudFront
        resumeTraining.imgThirdVMClass = `${cloudfrontUrl}/${key}`;
      }

      // Guardar en BD
      await resumeTraining.save();

      const resumeId = resumeTraining._id;
      const sportCategoryId = resumeTraining.sportCategoryId;
      const arrayStudentsForSurvey = resumeTraining.presentStudents;

      await createSurveysForPlayers(
        resumeId,
        arrayStudentsForSurvey,
        sportCategoryId
      );

      // Aplicar URLs de CloudFront al resumen antes de devolverlo
      const resumeWithUrls = attachCloudFrontUrls(resumeTraining);

      res.status(201).json(resumeWithUrls);
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Error to create resume training" });
    }
  },

  getResumeTrainingBySportCategory: async (req, res) => {
    try {
      const { sportCategoryId } = req.params;
      let resumeTraining = await ResumeVmClass.find({
        sportCategoryId: sportCategoryId,
      }).sort({ createdAt: -1 });

      // Aplicar URLs de CloudFront a todos los resúmenes
      resumeTraining = resumeTraining.map(resume => attachCloudFrontUrls(resume));

      res.status(200).json(resumeTraining);
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Error to get resume training" });
    }
  },

  getResumeTrainingById: async (req, res) => {
    try {
      const { resumeTrainingId } = req.params;
      let resumeTraining = await ResumeVmClass.findById(resumeTrainingId);

      if (resumeTraining) {
        // Aplicar URLs de CloudFront
        resumeTraining = attachCloudFrontUrls(resumeTraining);
      }

      res.status(200).json(resumeTraining);
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Error to get resume training" });
    }
  },

  getResumeByTeacher: async (req, res) => {
    try {
      const { teacherId } = req.params;
      let resumeTraining = await ResumeVmClass.find({
        byTeacher: teacherId,
      }).sort({ createdAt: -1 });

      // Aplicar URLs de CloudFront a todos los resúmenes
      resumeTraining = resumeTraining.map(resume => attachCloudFrontUrls(resume));

      res.status(200).json(resumeTraining);
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Error to get resume training" });
    }
  },
};

module.exports = resumeVMTrainingController;
