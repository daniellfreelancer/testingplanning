const ResumeVmClass = require("../models/resumeVmTraining");
const SportCategory = require("../models/sportCategory");
const SportPlanification = require("../models/sportPlanification");
const User = require("../models/admin");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const upLoadFiles = require("../s3");
const crypto = require("crypto");
const Survey = require("../models/survey");


const clientAWS = new S3Client({
  region: process.env.AWS_BUCKET_REGION_VMCLASS,
  credentials: {
    accessKeyId: process.env.AWS_PUBLIC_KEY_VMCLASS,
    secretAccessKey: process.env.AWS_SECRET_KEY_VMCLASS,
  },
});
const quizIdentifier = () => crypto.randomBytes(32).toString("hex");

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

      if (req.files && req.files["imgFirstVMClass"]) {
        const fileContent = req.files["imgFirstVMClass"][0].buffer;
        const fileName = `${
          req.files["imgFirstVMClass"][0].fieldname
        }-${quizIdentifier()}.png`;

        const uploadFirst = {
          Bucket: process.env.AWS_BUCKET_NAME_VMCLASS,
          Key: fileName,
          Body: fileContent,
        };

        const uploadCommand = new PutObjectCommand(uploadFirst);
        await clientAWS.send(uploadCommand);

        resumeTraining.imgFirstVMClass = fileName;
      }
      // Verificar si se cargó la imagen del campo imgSecondVMClass
      if (req.files && req.files["imgSecondVMClass"]) {
        const fileContent = req.files["imgSecondVMClass"][0].buffer;
        const fileName = `${
          req.files["imgSecondVMClass"][0].fieldname
        }-${quizIdentifier()}.png`;

        const uploadSecond = {
          Bucket: process.env.AWS_BUCKET_NAME_VMCLASS,
          Key: fileName,
          Body: fileContent,
        };

        const uploadCommand = new PutObjectCommand(uploadSecond);
        await clientAWS.send(uploadCommand);

        resumeTraining.imgSecondVMClass = fileName;
      }
      if (req.files && req.files["imgThirdVMClass"]) {
        const fileContent = req.files["imgThirdVMClass"][0].buffer;
        const fileName = `${
          req.files["imgThirdVMClass"][0].fieldname
        }-${quizIdentifier()}.png`;

        const uploadThird = {
          Bucket: process.env.AWS_BUCKET_NAME_VMCLASS,
          Key: fileName,
          Body: fileContent,
        };

        const uploadCommand = new PutObjectCommand(uploadThird);
        await clientAWS.send(uploadCommand);

        resumeTraining.imgThirdVMClass = fileName;
      }

      // Guardar la instancia del modelo en la base de datos
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
  }
};

module.exports = resumeVMTrainingController;
