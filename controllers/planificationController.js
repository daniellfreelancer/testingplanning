const Planification = require('../models/planification');
const ClassRoom = require('../models/classroom')



const planificationController = {


    // create : async (req, res) => {
    //     try {
    //         const newPlanification = await new Planification(req.body).save()

    //         if (newPlanification){
    //             let planificationID =  newPlanification._id

    //             const classroomGrade = await ClassRoom.findById(req.body.classroom);

    //             if (classroomGrade){

    //                 classroomGrade.planner.push(planificationID)

    //                 res.status(200).json({ response: newPlanification, id: planificationID, message: "agregado planificacion y a salon de clase"})
    //             }
    //         } else {
    //             res.status(400).json({
    //                 message: "error, creando nueva planificacion",
    //             success:false
    //             }
    //             )
    //         }

    //     } catch (error) {
    //         console.log(error)
    //         res.status(400).json({
    //             message: "error al intentar crear la planificación",
    //             success: false
    //         })
    //     }


    // }

    create: async (req, res) => {
        try {
          const newPlanification = await new Planification(req.body).save();
      
          if (newPlanification) {
            let planificationID = newPlanification._id;
      
            const classroomGrade = await ClassRoom.findById(req.body.classroom);
      
            if (classroomGrade) {
              classroomGrade.planner.push(planificationID);
              const updatedClassroomGrade = await classroomGrade.save();
      
              res.status(200).json({
                response: newPlanification,
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
      // deletePlanification: async (req, res) => {

      //   const {id} = req.params;

      //   try {

      //     const planification = await Planification.findById(id)

      //     if (!planification) {
      //       res.status(404).json({
      //         message: 'No se puede Eliminar , consulte con el administrador',
      //         success: false
      //     })
      //     } else {
      //       let planificationDeleted = await Planification.findByIdAndDelete(id)
      //       res.status(200).json({
      //         message: 'Planificación eliminada con exito',
      //         success: true
      //     })
      //     }
          

      //   } catch (error) {
      //     console.log(error)
      //     res.status(400).json({
      //         message: error.message,
      //         succes: false
      //     })
      //   }

      // }
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
      }



}

module.exports = planificationController