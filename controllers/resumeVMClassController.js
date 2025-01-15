const ResumeVmClass = require('../models/resumeVMclass');
const ClassRoom = require('../models/classroom')
const Workshop = require('../models/workshop')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const upLoadFiles = require('../s3')
const crypto = require('crypto')
const Survey = require('../models/survey')

const resumeQueryPopulate = [
  {
    path: 'byTeacher plannerClass'
  }
]

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
        status
      })

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
        status
      })

      surveys.push(newSurvey);
    }
  }

  await Survey.insertMany(surveys);
};


const resumeVMClassController = {

  createResume: async (req, res) => {

    const clientAWS = new S3Client({
      region: process.env.AWS_BUCKET_REGION_VMCLASS,
      credentials: {
        accessKeyId: process.env.AWS_PUBLIC_KEY_VMCLASS,
        secretAccessKey: process.env.AWS_SECRET_KEY_VMCLASS,
      },
    })
    const quizIdentifier = () => crypto.randomBytes(32).toString('hex')

    try {
      // Extraer los campos necesarios de req.body
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

      //   Crear una nueva instancia del modelo
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
        workshopId
      });



      if (req.files && req.files['imgFirstVMClass']) {
        const fileContent = req.files['imgFirstVMClass'][0].buffer;
        const fileName = `${req.files['imgFirstVMClass'][0].fieldname}-${quizIdentifier()}.png`;

        const uploadFirst = {
          Bucket: process.env.AWS_BUCKET_NAME_VMCLASS,
          Key: fileName,
          Body: fileContent,
        };

        const uploadCommand = new PutObjectCommand(uploadFirst);
        await clientAWS.send(uploadCommand);

        resume.imgFirstVMClass = fileName;
      }
      // Verificar si se cargó la imagen del campo imgSecondVMClass
      if (req.files && req.files['imgSecondVMClass']) {
        const fileContent = req.files['imgSecondVMClass'][0].buffer;
        const fileName = `${req.files['imgSecondVMClass'][0].fieldname}-${quizIdentifier()}.png`;

        const uploadSecond = {
          Bucket: process.env.AWS_BUCKET_NAME_VMCLASS,
          Key: fileName,
          Body: fileContent,
        };

        const uploadCommand = new PutObjectCommand(uploadSecond);
        await clientAWS.send(uploadCommand);

        resume.imgSecondVMClass = fileName;
      }
      if (req.files && req.files['imgThirdVMClass']) {
        const fileContent = req.files['imgThirdVMClass'][0].buffer;
        const fileName = `${req.files['imgThirdVMClass'][0].fieldname}-${quizIdentifier()}.png`;

        const uploadThird = {
          Bucket: process.env.AWS_BUCKET_NAME_VMCLASS,
          Key: fileName,
          Body: fileContent,
        };

        const uploadCommand = new PutObjectCommand(uploadThird);
        await clientAWS.send(uploadCommand);

        resume.imgThirdVMClass = fileName;
      }

      // Guardar la instancia del modelo en la base de datos
      await resume.save();

      // Obtener el ID del resume guardado
      const resumeId = resume._id;
      const arrayStudentsForSurvey = resume.presentStudents;

      try {

        if (req.body.classroomId) {
          const classroom = await ClassRoom.findById(req.body.classroomId)
          if (classroom) {
            classroom.classHistory.push(resumeId)
            await classroom.save();

            // Crear encuestas para los estudiantes
            await createSurveysForStudents(resumeId, arrayStudentsForSurvey, req.body.classroomId);
            res.status(200).json({
              message: 'VMClass Finalizado con exito',
              success: true,
              response: resume
            });
          }
        }  

        if (req.body.workshopId) {
          const workshop = await Workshop.findById(req.body.workshopId)

          if (workshop) {

            workshop.workshopHistory.push(resumeId)
            await workshop.save()
            await createSurveysForStudentsWorkshop(resumeId, arrayStudentsForSurvey, req.body.workshopId);
            res.status(200).json({
              message: 'VMClass Finalizado con exito',
              success: true,
              response: resume
            });
          }
        }

      } catch (error) {
        console.log(error)
        return res.status(500).send({
          message: "Error al guardar el VMClass en la base de datos.",
          success: false
          })
      }

    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to add Resume VM' });
    }
  },
  getResume: async (req, res) => {
    try {
      // Obtener todos los documentos ResumeVmClass
      const resumes = await ResumeVmClass.find()
        .populate('byTeacher', ({ name: 1, lastName: 1 })).populate('plannerClass').populate('classroomId', ({ grade: 1, level: 1, section: 1 }))

      res.status(200).json(resumes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch resumes' });
    }
  },
  // getResumeById: async (req, res) => {

  //   let { id } = req.params;

  //   try {

  //     const resumeFund = await ResumeVmClass.findById(id).populate('byTeacher', { name: 1, lastName: 1 }).populate('plannerClass').populate('classroomId', { grade: 1, section: 1, level: 1 })

  //     if (resumeFund) {
  //       res.status(200).json({
  //         response: resumeFund,
  //         success: true,
  //         message: "Resumen VMClass encontrado"
  //       })
  //     } else res.status(404).json({ message: "no se pudo encontrar Resumen VMClass", success: false })

  //   } catch (error) {
  //     console.log(error)
  //     res.status(400).json({
  //       message: "Error al realizar peticion de busqueda de busqueda",
  //       success: false
  //     })
  //   }
  // },
  getResumeByClassroom: async (req, res) => {
    const { classroomId } = req.params; // Obtén el classroomId de los parámetros de la solicitud

    try {
      const resumes = await ResumeVmClass
        .find({ classroomId }) // Busca documentos con el classroomId proporcionado
        .populate('plannerClass') // Realiza un populate en el campo byTeacher para obtener información adicional (nombre y email)
        .sort({ createdAt: -1 }) // Ordena por createdAt en orden descendente (del más reciente al más antiguo)
        .exec();

      res.json(resumes); // Devuelve los resúmenes encontrados en formato JSON
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
        // Ajustar el formato de "presentStudents" si llega como un array de strings
        if (Array.isArray(resumeFund.presentStudents) && typeof resumeFund.presentStudents[0] === 'string') {
          resumeFund.presentStudents = resumeFund.presentStudents.map(student => JSON.parse(student));
        }
  
        res.status(200).json({
          response: resumeFund,
          success: true,
          message: "Resumen VMClass encontrado",
        });
      } else {
        res.status(404).json({
          message: "no se pudo encontrar Resumen VMClass",
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "Error al realizar peticion de busqueda de busqueda",
        success: false,
      });
    }
  }
  



}

module.exports = resumeVMClassController