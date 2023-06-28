const WorkshopPlanification = require('../models/workshopPlanification')
const Workshop = require('../models/workshop')

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const upLoadFiles = require('../s3')
const crypto = require('crypto')
const sharp = require('sharp');

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const bucketRegion = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET_NAME
const publicKey = process.env.AWS_PUBLIC_KEY
const privateKey = process.env.AWS_SECRET_KEY

const  clientAWS = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: publicKey,
    secretAccessKey: privateKey,
  },
})

const quizIdentifier = () => crypto.randomBytes(32).toString('hex')


const workshopPlanificationController = {

    createPlanification : async (req, res) => {

        const savedPlanification = new WorkshopPlanification(req.body);

        try {

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
          
                const workshop = await Workshop.findById(req.body.workshop);
          
                if (workshop) {
                  workshop.planner.push(planificationID);
                  const updatedClassroomGrade = await workshop.save();
          
                  res.status(200).json({
                    response: savedPlanification,
                    id: planificationID,
                    message: "Planificación creada y agregada al taller",
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
    deletePlanificationWorkshop : async (req, res) => {

        const { planificationId, workshopId } = req.params;

        try {
            const planification = await WorkshopPlanification.findById(planificationId);
            const workshop = await Workshop.findById(workshopId);
        
            if (!planification || !workshop) {
              return res.status(404).json({
                message: 'Planificación o Taller no encontrado',
                success: false
              });
            }
  
              let quizdoc = planification.quiz

              if (quizdoc) {
                const params = {
                  Bucket: bucketName,
                  Key: quizdoc
                }
    
                const command = new DeleteObjectCommand(params)
                await clientAWS.send(command)
  
              }
  

  
            // Elimina la planificación de la colección de Planificación
            await WorkshopPlanification.deleteOne({ _id: planificationId });
        
            // Elimina la planificación de la lista de planificaciones de la Clase
            const index = workshop.planner.indexOf(planificationId);
            if (index > -1) {
              workshop.planner.splice(index, 1);
              await workshop.save();
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
      const {id} = req.params
        try {

            let planificationFund = await WorkshopPlanification.findById(id).populate('workshop')

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
    updatePlanification: async (req, res)=>{
        const { planificationId } = req.params;
        try {
            const planification = await WorkshopPlanification.findByIdAndUpdate(planificationId, req.body);

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

    }

}

module.exports = workshopPlanificationController