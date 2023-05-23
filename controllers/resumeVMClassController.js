const ResumeVmClass = require('../models/resumeVMclass');


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
            plannerNoClass

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
            plannerNoClass

          });
      
          // Verificar si se cargó la imagen del campo imgFirstVMClass
          if (req.files && req.files['imgFirstVMClass']) {
            const imgFirstVMClass = req.files['imgFirstVMClass'][0];
            resume.setImgFirstVMClassUrl(imgFirstVMClass.filename);
          }
      
          // Verificar si se cargó la imagen del campo imgSecondVMClass
          if (req.files && req.files['imgSecondVMClass']) {
            const imgSecondVMClass = req.files['imgSecondVMClass'][0];
            resume.setImgSecondVMClassUrl(imgSecondVMClass.filename);
          }
      
          // Verificar si se cargó la imagen del campo imgThirdVMClass
          if (req.files && req.files['imgThirdVMClass']) {
            const imgThirdVMClass = req.files['imgThirdVMClass'][0];
            resume.setImgThirdVMClassUrl(imgThirdVMClass.filename);
          }
      
          // Guardar la instancia del modelo en la base de datos
          await resume.save();
      
          res.status(200).json({ message: 'Resume VM added successfully' });
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: 'Failed to add Resume VM' });
        }
      }
      

}

module.exports = resumeVMClassController