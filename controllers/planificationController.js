const Planification = require('../models/planification');
const ClassRoom = require('../models/classroom')



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
     
    createPlanification: async (req, res) => {
      try {
        const newPlanification = new Planification(req.body);
    
        if (req.file) {
          let { filename } = req.file;
          newPlanification.quiz = filename;
        }
    
        const savedPlanification = await newPlanification.save();
    
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
    
    deletePlanification : async (req, res) => {
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

        const {id} = req.params;

        try {

          let planificationFund = await Planification.findById(id).populate('classroom')

          if(!planificationFund){
            return res.status(404).json({
              message: 'Planificación no encontrada',
              success: false
            });
          } else {
            return res.status(200).json(planificationFund);
          }


          
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
          const planification = await Planification.findByIdAndUpdate(planificationId, req.body);
        
          if (!planification) {
            return res.status(404).json({
              message: 'Planificación no encontrada',
              success: false
            });
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

module.exports = planificationController