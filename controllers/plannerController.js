const Planning = require('../models/planner');



const planningController = {

   //agragar planificacion 
    createPlan : async (req, res) =>{

        try {
            
            const newPlan = new Planning(req.body);
            const savedPlan = await newPlan.save();
            res.status(201).json({
                response: savedPlan,
                success: true
            })

        } catch (error) {
            console.log(error)
              res.status(400).json({ 
                message: error.message,
                success: false
            });
        }

    },
    //agregar unidad de programa regular
    addRPU : async (req, res) => {

        const{id} = req.params;

        try {

            const programUnity = await Planning.findById(id)

            if (programUnity) {
                res.status(201).json(programUnity)
            } else {
                res.status(400).json({
                    message: "cant find Regular Program Unity"
                })
            }
            
        } catch (error) {
            console.log(error)
            res.status(400).json({ 
              message: error.message,
              success: false
          });

        }



    },
    //agregar y actualizar Aprendizajes Basales
    addAndUpdateAB: async (req, res) =>{
    //     try {
    //         const { id } = req.params;
    //         const { newAT } = req.body;
    //         const updatedPlanner = await Planning.findById(id);

           

    //         if (updatedPlanner) {
                
    //             let ABforUpdate = await Planning.findByIdAndUpdate(id,updatedPlanner.REGULAR_PROGRAM_UNIT[0].AB.push(newAT) )

    //             res.status(201).json({
    //                 rpu: ABforUpdate,
    //                 success: true
    //             })
    //         } else {
    //             res.status(400).json({ message: "Doesnt Exist RPU", success: false });
    //         }

    //       } catch (error) {
    //         res.status(400).json({ message: error.message });
    //       }

    const newObjective = req.body;
  const grade = req.params.grade;
  const level = req.params.level;

  try {
    const planner = await Planning.findOneAndUpdate(
      { GRADE: grade, LEVEL: level },
      { $push: { 'REGULAR_PROGRAM_UNIT.$[unit].APRENDIZAJES': newObjective } },
      { arrayFilters: [{ 'unit.TITLE': { $exists: true } }], new: true }
    );

    res.status(200).json(planner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

    },
    insertObjective: async (req, res) => {
        const newObjective = req.body;
        const grade = req.params.grade;
        const level = req.params.level;
      
        try {
          const planner = await Planning.findOneAndUpdate(
            { GRADE: grade, LEVEL: level },
            { $push: { 'REGULAR_PROGRAM_UNIT.$[unit].APRENDIZAJES': newObjective } },
            { arrayFilters: [{ 'unit.TITLE': { $exists: true } }], new: true }
          );
      
          res.status(200).json(planner);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      },
    getPlanners: async (req, res)=>{
        try {

            const data = await Planning.find()

            if (data) {
                res.status(200).json(data)
            } else {
                res.status(200).json({
                    message: "There is not Data",
                    success: false
                })
            }

        } catch (error) {
            console.log(error)
            res.status(400).json({ 
                message: error.message,
                success: false
            });
        }
    },
    addRegularProgramUnit : async (req, res)  => {
        const newUnit = req.body;
        const grade = req.params.grade;
        const level = req.params.level;
      
        try {
          const planner = await Planning.findOneAndUpdate(
            { GRADE: grade, LEVEL: level },
            { $push: { REGULAR_PROGRAM_UNIT: newUnit } },
            { new: true }
          );
      
          res.status(200).json(planner);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      },
      addAprendizajesToUnit : async (req, res) => {
        const unitNumber = req.params.unit;
      
        try {
          const planner = await Planning.findOne({}); // obtenemos el único documento de la colección
          const unit = planner.REGULAR_PROGRAM_UNIT.find(u => u.UNIT === Number(unitNumber)); // buscamos la unidad correspondiente al número indicado
          if (!unit) {
            return res.status(404).json({ message: `La unidad ${unitNumber} no existe` });
          }
      
          const { TIPO_DE_APRENDIZAJE, OBJETIVOS_DE_LA_CLASE, INDICADOR_DE_EVALUACION, ACTIVIDADES, MATERIALES, TIPO_DE_EVALUACION } = req.body;
          const newAprendizaje = { TIPO_DE_APRENDIZAJE, OBJETIVOS_DE_LA_CLASE, INDICADOR_DE_EVALUACION, ACTIVIDADES, MATERIALES, TIPO_DE_EVALUACION };
          unit.APRENDIZAJES.push(newAprendizaje);
          await planner.save();
      
          res.status(201).json({ message: `Aprendizaje agregado a la unidad ${unitNumber}` });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error al procesar la solicitud' });
        }
      },
      insertAprendizaje : async (req, res) => {
        const { grade, level, unit, TIPO_DE_APRENDIZAJE, OBJETIVO_DE_APRENDIZAJE, OBJETIVOS_DE_LA_CLASE, INDICADOR_DE_EVALUACION, ACTIVIDADES, MATERIALES, TIPO_DE_EVALUACION } = req.body;
      
        try {
          // Buscamos el planificador correspondiente al grado y nivel indicados
          let planner = await Planning.findOne({ GRADE: grade, LEVEL: level });
      
          if (!planner) {
            return res.status(404).json({ message: 'No se encontró un planificador para el grado y nivel especificados' });
          }
      
          // Buscamos el programa correspondiente a la unidad indicada
          let programa = planner.REGULAR_PROGRAM_UNIT.find(prog => prog.UNIT === unit);
      
          if (!programa) {
            return res.status(404).json({ message: 'No se encontró un programa para la unidad especificada' });
          }
      
          // Creamos el objeto del nuevo aprendizaje
          let newAprendizaje = {
            TIPO_DE_APRENDIZAJE: TIPO_DE_APRENDIZAJE,
            OBJETIVO_DE_APRENDIZAJE: OBJETIVO_DE_APRENDIZAJE,
            OBJETIVOS_DE_LA_CLASE: OBJETIVOS_DE_LA_CLASE,
            INDICADOR_DE_EVALUACION: INDICADOR_DE_EVALUACION,
            ACTIVIDADES: ACTIVIDADES,
            MATERIALES: MATERIALES,
            TIPO_DE_EVALUACION: TIPO_DE_EVALUACION
          };
      
          // Agregamos el nuevo aprendizaje al programa correspondiente
          programa.APRENDIZAJES.push(newAprendizaje);
      
          // Guardamos los cambios en la base de datos
          await planner.save();
      
          // Respondemos con el planificador actualizado
          res.json(planner);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Hubo un error al agregar el aprendizaje' });
        }
      },
      insertResources : async (req, res) => {
        const { grade, level, unit, TITULO, CONTENIDO } = req.body;
      
        try {
          // Buscamos el planificador correspondiente al grado y nivel indicados
          let planner = await Planning.findOne({ GRADE: grade, LEVEL: level });
      
          if (!planner) {
            return res.status(404).json({ message: 'No se encontró un planificador para el grado y nivel especificados' });
          }
      
          // Buscamos el programa correspondiente a la unidad indicada
          let programa = planner.REGULAR_PROGRAM_UNIT.find(prog => prog.UNIT === unit);
      
          if (!programa) {
            return res.status(404).json({ message: 'No se encontró un programa para la unidad especificada' });
          }
      
          // Creamos el objeto del nuevo aprendizaje
          let newRECURSOS = {
            TITULO: TITULO,
            CONTENIDO: CONTENIDO
          };
      
          // Agregamos el nuevo aprendizaje al programa correspondiente
          programa.RECURSOS.push(newRECURSOS);
      
          // Guardamos los cambios en la base de datos
          await planner.save();
      
          // Respondemos con el planificador actualizado
          res.json(planner);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Hubo un error al agregar el recurso' });
        }
      }
      
      

}

module.exports = planningController