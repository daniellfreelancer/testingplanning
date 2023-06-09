const ResumeVmClass = require('../models/resumeVMclass');
const ClassRoom = require('../models/classroom')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const upLoadFiles = require('../s3')
const crypto = require('crypto')

const resumeVMClassController = {

    // createResume: async (req, res) => {



    //     try {

    //         let resume = await new ResumeVmClass(req.body).save()

    //         // Verificar si se cargó la imagen del campo imgFirstVMClass
    //         if (req.files && req.files['imgFirstVMClass']) {
    //             const imgFirstVMClass = req.files['imgFirstVMClass'][0];
    //             resume.setImgFirstVMClassUrl(imgFirstVMClass.filename);
    //         }

    //         // Verificar si se cargó la imagen del campo imgSecondVMClass
    //         if (req.files && req.files['imgSecondVMClass']) {
    //             const imgSecondVMClass = req.files['imgSecondVMClass'][0];
    //             resume.setImgSecondVMClassUrl(imgSecondVMClass.filename);
    //         }

    //         // Verificar si se cargó la imagen del campo imgThirdVMClass
    //         if (req.files && req.files['imgThirdVMClass']) {
    //             const imgThirdVMClass = req.files['imgThirdVMClass'][0];
    //             resume.setImgThirdVMClassUrl(imgThirdVMClass.filename);
    //         }

    //         // Guardar la instancia del modelo en la base de datos
    //         await resume.save();

    //         res.status(200).json({ message: 'Resume VM added successfully' });
    //     } catch (error) {
    //         console.log(error)
    //         res.status(500).json({ error: 'Failed to add Resume VM' });
    //     }


    // } 
    createResume: async (req, res) => {

      const  clientAWS = new S3Client({
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
            classroomId

          } = req.body;
      
          // Crear una nueva instancia del modelo
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
            classroomId

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



          
          // // Verificar si se cargó la imagen del campo imgFirstVMClass
          // if (req.files && req.files['imgFirstVMClass']) {
          //   const imgFirstVMClass = req.files['imgFirstVMClass'][0];
          //   resume.setImgFirstVMClassUrl(imgFirstVMClass.filename);
          // }

          // // Verificar si se cargó la imagen del campo imgSecondVMClass
          // if (req.files && req.files['imgSecondVMClass']) {
          //   const imgSecondVMClass = req.files['imgSecondVMClass'][0];
          //   resume.setImgSecondVMClassUrl(imgSecondVMClass.filename);
          // }

          // // Verificar si se cargó la imagen del campo imgThirdVMClass
          // if (req.files && req.files['imgThirdVMClass']) {
          //   const imgThirdVMClass = req.files['imgThirdVMClass'][0];
          //   resume.setImgThirdVMClassUrl(imgThirdVMClass.filename);
          // }

      
          // Guardar la instancia del modelo en la base de datos
          await resume.save();

            // Obtener el ID del resume guardado
            const resumeId = resume._id;
            try {
                const classroom = await ClassRoom.findById(req.body.classroomId)

                if (classroom){
                    classroom.classHistory.push(resumeId)
                    await classroom.save();
                    res.status(200).json({ 
                        message: 'VMClass Finalizado con exito',
                        success: true    
                    });
                } else {
                    res.status(400).json({
                        message: "Error al crear resumen de clase",
                        success: false,
                      });
                }

            } catch (error) {
                console.log(error)
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
          .populate('byTeacher',( {name: 1,lastName: 1 })).populate('plannerClass').populate('classroomId',( {grade: 1,level: 1, section: 1 }))
      
          res.status(200).json(resumes);
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: 'Failed to fetch resumes' });
        }
      },
      getResumeById: async (req, res) =>{

        let {id} = req.params;

        try {

          const resumeFund = await ResumeVmClass.findById(id).populate('byTeacher',{name:1, lastName:1}).populate('plannerClass').populate('classroomId', {grade:1, section:1, level:1})

          if (resumeFund){
            res.status(200).json({
              response: resumeFund,
              success: true,
              message: "Resumen VMClass encontrado"
            })
          } else res.status(404).json({message: "no se pudo encontrar Resumen VMClass", success: false})
          
        } catch (error) {
          console.log(error)
          res.status(400).json({
            message: "Error al realizar peticion de busqueda de busqueda",
            success: false
          })
        }
      }

      

}

module.exports = resumeVMClassController