const ResumeVmClass = require("../models/resumeVmTraining");
const SportCategory = require("../models/sportCategory");
const SportPlanification = require("../models/sportPlanification");
const User = require("../models/admin");
const Survey = require("../models/survey");

// ✅ helper centralizado para VMCLASS
const {
  uploadMulterFileVmclass,
} = require("../utils/s3ClientVMclass");

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
        resumeTraining.imgFirstVMClass = key;
      }

      if (req.files && req.files["imgSecondVMClass"]?.[0]) {
        const file = req.files["imgSecondVMClass"][0];
        const key = await uploadMulterFileVmclass(file);
        resumeTraining.imgSecondVMClass = key;
      }

      if (req.files && req.files["imgThirdVMClass"]?.[0]) {
        const file = req.files["imgThirdVMClass"][0];
        const key = await uploadMulterFileVmclass(file);
        resumeTraining.imgThirdVMClass = key;
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

      res.status(201).json(resumeTraining);
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Error to create resume training" });
    }
  },

  getResumeTrainingBySportCategory: async (req, res) => {
    try {
      const { sportCategoryId } = req.params;
      const resumeTraining = await ResumeVmClass.find({
        sportCategoryId: sportCategoryId,
      }).sort({ createdAt: -1 });
      res.status(200).json(resumeTraining);
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Error to get resume training" });
    }
  },

  getResumeTrainingById: async (req, res) => {
    try {
      const { resumeTrainingId } = req.params;
      const resumeTraining = await ResumeVmClass.findById(resumeTrainingId);
      res.status(200).json(resumeTraining);
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Error to get resume training" });
    }
  },

  getResumeByTeacher: async (req, res) => {
    try {
      const { teacherId } = req.params;
      const resumeTraining = await ResumeVmClass.find({
        byTeacher: teacherId,
      }).sort({ createdAt: -1 });
      res.status(200).json(resumeTraining);
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Error to get resume training" });
    }
  },
};

module.exports = resumeVMTrainingController;
