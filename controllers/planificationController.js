const Planification = require('../models/planification');
const ClassRoom = require('../models/classroom')
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const upLoadFiles = require('../s3')
const crypto = require('crypto')
const sharp = require('sharp');

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


// const client = new S3Client(clientParams);
// const command = new GetObjectCommand(getObjectParams);
// const url = await getSignedUrl(client, command, { expiresIn: 3600 });


const bucketRegion = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET_NAME
const publicKey = process.env.AWS_PUBLIC_KEY
const privateKey = process.env.AWS_SECRET_KEY

const clientAWS = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: publicKey,
    secretAccessKey: privateKey,
  },
})

const quizIdentifier = () => crypto.randomBytes(32).toString('hex')

const planificationController = {

  // createPlanification: async (req, res) => {
  //   // let {filename} = req.file
  //     try {
  //       const newPlanification = await new Planification(req.body).save();

  //       if (req.file){
  //         let {filename} = req.file
  //         newPlanification.quiz = filename

  //         await newPlanification.save()
  //       }



  //       if (newPlanification) {
  //         let planificationID = newPlanification._id;

  //         const classroomGrade = await ClassRoom.findById(req.body.classroom);

  //         if (classroomGrade) {
  //           classroomGrade.planner.push(planificationID);
  //           const updatedClassroomGrade = await classroomGrade.save();

  //           res.status(200).json({
  //             response: newPlanification,
  //             id: planificationID,
  //             message: "Planificación creada y agregada al aula",
  //           });
  //         }
  //       } else {
  //         res.status(400).json({
  //           message: "Error al crear la planificación",
  //           success: false,
  //         });
  //       }
  //     } catch (error) {
  //       console.log(error);
  //       res.status(400).json({
  //         message: "Error al intentar crear la planificación",
  //         success: false,
  //       });
  //     }
  //   },

  // createPlanification: async (req, res) => {
  //   try {
  //     const newPlanification = new Planification(req.body);

  //     if (req.file) {
  //       let { filename } = req.file;
  //       newPlanification.quiz = filename;
  //     }

  //     const savedPlanification = await newPlanification.save();

  //     if (savedPlanification) {
  //       const planificationID = savedPlanification._id;

  //       const classroomGrade = await ClassRoom.findById(req.body.classroom);

  //       if (classroomGrade) {
  //         classroomGrade.planner.push(planificationID);
  //         const updatedClassroomGrade = await classroomGrade.save();

  //         res.status(200).json({
  //           response: savedPlanification,
  //           id: planificationID,
  //           message: "Planificación creada y agregada al aula",
  //         });
  //       }
  //     } else {
  //       res.status(400).json({
  //         message: "Error al crear la planificación",
  //         success: false,
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     res.status(400).json({
  //       message: "Error al intentar crear la planificación",
  //       success: false,
  //     });
  //   }
  // },


  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * Esta funcion se utiliza para crear una planificacion, recibe por form-data JSON y File
   */
  createPlanification: async (req, res) => {

    //resize image
    // const imgbuffer = await sharp(req.file.buffer).resize({ height:1920, width:1080, fit: "contain" } ).toBuffer()

    try {
      const savedPlanification = new Planification(req.body);


      if (req.file) {
        const fileContent = req.file.buffer;
        const extension = req.file.originalname.split('.').pop();
        const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;

        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: fileContent,

        };

        // Subir el archivo a S3
        const uploadCommand = new PutObjectCommand(uploadParams);
        await clientAWS.send(uploadCommand);

        savedPlanification.quiz = fileName; // Guardar el nombre del archivo en el campo quiz
      }

      await savedPlanification.save();

      if (savedPlanification) {
        const planificationID = savedPlanification._id;

        const classroomGrade = await ClassRoom.findById(req.body.classroom);

        if (classroomGrade) {
          classroomGrade.planner.push(planificationID);
          const updatedClassroomGrade = await classroomGrade.save();

          res.status(200).json({
            response: savedPlanification,
            id: planificationID,
            message: "Planificación creada y agregada al aula",
          });
        }
      } else {
        res.status(400).json({
          message: "Error al crear la planificación",
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "Error al intentar crear la planificación",
        success: false,
      });
    }
  },
  deletePlanification: async (req, res) => {
    const { planificationId, classroomId } = req.params;
    try {
      const planification = await Planification.findById(planificationId);
      const classroomGrade = await ClassRoom.findById(classroomId);

      if (!planification || !classroomGrade) {
        return res.status(404).json({
          message: 'Planificación o Clase no encontrada',
          success: false
        });
      }

      if (planification.evaluationType === "Sumativa") {
        let quizdoc = planification.quiz

        const params = {
          Bucket: bucketName,
          Key: quizdoc
        }

        const command = new DeleteObjectCommand(params)
        await clientAWS.send(command)

      }

      // Elimina la planificación de la colección de Planificación
      await Planification.deleteOne({ _id: planificationId });

      // Elimina la planificación de la lista de planificaciones de la Clase
      const index = classroomGrade.planner.indexOf(planificationId);
      if (index > -1) {
        classroomGrade.planner.splice(index, 1);
        await classroomGrade.save();
      }

      res.status(200).json({
        message: 'Planificación eliminada con éxito',
        success: true
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al intentar eliminar la planificación',
        success: false
      });
    }
  },
  getPlanificationById: async (req, res) => {

    const { id } = req.params;

    try {

      let planificationFund = await Planification.findById(id).populate('classroom')

      if (!planificationFund) {
        return res.status(404).json({
          message: 'Planificación no encontrada',
          success: false
        });
      }
      return res.status(200).json(planificationFund);

    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "Error al intentar buscar la planificación",
        success: false,
      });
    }

  },
  updatePlanification: async (req, res) => {
    const { planificationId } = req.params;


    try {
      const planification = await Planification.findByIdAndUpdate(planificationId, req.body);

      if (!planification) {
        return res.status(404).json({
          message: 'Planificación no encontrada',
          success: false
        });
      }

      if (req.file) {
        const fileContent = req.file.buffer;
        const extension = req.file.originalname.split('.').pop();
        const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;

        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: fileContent,

        };

        // Subir el archivo a S3
        const uploadCommand = new PutObjectCommand(uploadParams);
        await clientAWS.send(uploadCommand);

        planification.quiz = fileName; // Guardar el nombre del archivo en el campo quiz
      }

      await planification.save()

      res.status(200).json({
        message: 'Planificación actualizada con éxito',
        success: true,
        planification
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al intentar actualizar la planificación',
        success: false
      });
    }
  },
  getPlanifications : async (req, res) => {

    try {
      
      const planifications = await Planification.find()

      if (planifications) {

        res.status(201).json({
          message: 'Planificaciones encontradas',
          success: true,
          response: planifications
        })


      } else {

        res.status(400).json({
          message: 'No se encontraron planificaciones',
          success: false
          })


      }



    } catch (error) {

      res.status(400).json({
        message: 'Error al intentar obtener las planificaciones',
        success: false
        
      })
      
    }



  }



}

module.exports = planificationController