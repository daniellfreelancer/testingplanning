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
      }
      


}

module.exports = planificationController