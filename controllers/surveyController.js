const Survey = require('../models/survey')


const queryPopulateAll = [
    {
        path: 'classroom vmClass student',
        select: 'grade level name startClassTime lastName imgUrl ',
      },
]


const surveyController = {
    getSurveyByClassroom: async (req, res) => {
      try {
        const { classroomId } = req.params;
        const surveys = await Survey.find({ classroom: classroomId }).populate(queryPopulateAll);
        res.status(200).json({ surveys });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener encuestas por aula' });
      }
    },
  
    getSurveyByVmClass: async (req, res) => {
      try {
        const { vmClassId } = req.params;
        const surveys = await Survey.find({ vmClass: vmClassId }).populate(queryPopulateAll);
        res.status(200).json({ surveys });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener encuestas por VMClass' });
      }
    },
  
    getSurveyByStudentPending: async (req, res) => {
      try {
        const { studentId } = req.params;
        const surveys = await Survey.find({ student: studentId, status: false }).populate(queryPopulateAll);
        res.status(200).json({ surveys });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener encuestas pendientes por estudiante' });
      }
    },
  
    getSurveyByStudentDone: async (req, res) => {
      try {
        const { studentId } = req.params;
        const surveys = await Survey.find({ student: studentId, status: true }).populate(queryPopulateAll);
        res.status(200).json({ surveys });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener encuestas completadas por estudiante' });
      }
    },
    // updateSurveyStudent : async (req, res) => {
    //     try {
    //       const { surveyId } = req.params;
    //       const { sleepLevel, stressLevel, fatigueLevel, muscleLevel, moodLevel } = req.body;
      
    //       const survey = await Survey.findOne({surveyId});
      
    //       if (!survey) {
    //         return res.status(404).json({ message: 'Encuesta no encontrada' });
    //       }
      
    //       // Actualiza los valores y el estado
    //       survey.sleepLevel = sleepLevel;
    //       survey.stressLevel = stressLevel;
    //       survey.fatigueLevel = fatigueLevel;
    //       survey.muscleLevel = muscleLevel;
    //       survey.moodLevel = moodLevel;
    //       survey.status = true;
      
    //       await survey.save();
      
    //       res.status(200).json({ message: 'Encuesta actualizada con éxito' });
    //     } catch (error) {
    //       console.error(error);
    //       res.status(500).json({ error: 'Error al actualizar la encuesta del estudiante' });
    //     }
    //   }
    updateSurveyStudent : async (req, res) => {
      try {
        const { surveyId } = req.params;
        const { sleepLevel, stressLevel, fatigueLevel, muscleLevel, moodLevel } = req.body;
  
        // Utilizar findByIdAndUpdate para actualizar el documento
        const survey = await Survey.findByIdAndUpdate(surveyId, {
          sleepLevel,
          stressLevel,
          fatigueLevel,
          muscleLevel,
          moodLevel,
          status: true
        }, { new: true }); // { new: true } para obtener el documento actualizado
  
        if (!survey) {
          return res.status(404).json({ message: 'Encuesta no encontrada' });
        }
  
        res.status(200).json({ 
          message: 'Encuesta actualizada con éxito',
          response: survey,
          success: true
         });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la encuesta del estudiante' });
      }
    }
  
  };

module.exports = surveyController



