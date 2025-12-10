const Tasks = require('../models/tasks');
const Teacher = require('../models/admin');
const Classrooms = require('../models/classroom');
const Students = require('../models/student');

// NUEVO: usamos el helper centralizado de S3
const { uploadMulterFile } = require('../utils/s3Client');

const taskController = {
  createTask: async (req, res) => {
    let {
      title,
      description,
      fileStudent,
      status,
      classroom,
      notation,
      teacher,
      dueDate,
      feedback,
      deliveryDate,
      gradeBook,
    } = req.body;

    try {
      const newTask = new Tasks({
        title,
        description,
        fileStudent,
        status,
        classroom,
        notation,
        teacher,
        dueDate,
        feedback,
        deliveryDate,
        gradeBook,
      });

      // ⬇️ Si viene archivo del profe, lo subimos a S3 con el helper
      if (req.file) {
        const key = await uploadMulterFile(req.file);
        newTask.fileTeacher = key;
      }

      await newTask.save();

      // Buscar aula
      const classroomInfo = await Classrooms.findById(classroom);

      if (!classroomInfo) {
        return res.status(400).json({
          message: 'Aula no encontrada',
        });
      }

      // Asignar la tarea a cada estudiante del aula
      for (const studentId of classroomInfo.students) {
        await Students.findByIdAndUpdate(studentId, {
          $push: { tasks: newTask },
        });
      }

      res.status(200).json({
        response: newTask,
        message: 'Tarea creada y asignada a estudiantes',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al crear y asignar la tarea',
      });
    }
  },

  getAllTasks: async (req, res) => {
    try {
      const tasks = await Tasks.find().sort({ createdAt: -1 });

      res.status(200).json({
        tasks,
        message: 'Listado de tareas obtenido exitosamente',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al obtener el listado de tareas',
      });
    }
  },

  getTaskDetail: async (req, res) => {
    const taskId = req.params.id;

    try {
      const task = await Tasks.findById(taskId);

      if (!task) {
        return res.status(404).json({
          message: 'Tarea no encontrada',
        });
      }

      res.status(200).json({
        task,
        message: 'Detalle de tarea obtenido exitosamente',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al obtener el detalle de la tarea',
      });
    }
  },

  deleteTask: async (req, res) => {
    const taskId = req.params.id;

    try {
      const task = await Tasks.findByIdAndDelete(taskId);

      if (!task) {
        return res.status(404).json({
          message: 'Tarea no encontrada',
        });
      }

      res.status(200).json({
        message: 'Tarea eliminada exitosamente',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al eliminar la tarea',
      });
    }
  },

  deleteTaskFromClassroom: async (req, res) => {
    const taskId = req.params.taskId;
    const classroomId = req.params.classroomId;

    try {
      const classroom = await Classrooms.findById(classroomId);

      if (!classroom) {
        return res.status(404).json({
          message: 'Aula no encontrada',
        });
      }

      // Quitar la tarea de cada estudiante del aula
      for (const studentId of classroom.students) {
        await Students.findByIdAndUpdate(studentId, {
          $pull: { tasks: taskId },
        });
      }

      await Tasks.findByIdAndDelete(taskId);

      res.status(200).json({
        message: 'Tarea eliminada de los estudiantes y del sistema',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al eliminar la tarea del aula y de los estudiantes',
      });
    }
  },

  updateTaskInClassroom: async (req, res) => {
    const taskId = req.params.taskId;
    const classroomId = req.params.classroomId;
    const { title, description, fileStudent, status, notation, dueDate } =
      req.body;

    try {
      const classroom = await Classrooms.findById(classroomId);

      if (!classroom) {
        return res.status(404).json({
          message: 'Aula no encontrada',
        });
      }

      const updatedTask = await Tasks.findByIdAndUpdate(
        taskId,
        {
          title,
          description,
          fileStudent,
          status,
          notation,
          dueDate,
        },
        { new: true },
      );

      if (!updatedTask) {
        return res.status(404).json({
          message: 'Tarea no encontrada',
        });
      }

      res.status(200).json({
        message: 'Tarea actualizada en el aula',
        task: updatedTask,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al actualizar la tarea en el aula',
      });
    }
  },

  updateTaskForStudent: async (req, res) => {
    const studentId = req.params.studentId;
    const idTask = req.params.idTask;
    const updatedTaskData = req.body;

    try {
      const student = await Students.findById(studentId);

      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: 'Estudiante no encontrado' });
      }

      const taskIndex = student.tasks.findIndex(
        (task) => task._id.toString() === idTask,
      );

      if (taskIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada para este estudiante',
        });
      }

      // Mezclar datos existentes + nuevos
      student.tasks[taskIndex] = {
        ...student.tasks[taskIndex]._doc,
        ...updatedTaskData,
      };

      // ⬇️ Si viene archivo del estudiante, lo subimos con el helper
      if (req.file) {
        const key = await uploadMulterFile(req.file);
        student.tasks[taskIndex].fileStudent = key;
      }

      await student.save();

      return res.status(200).json({
        success: true,
        task: student.tasks[taskIndex],
        message: 'Tarea actualizada exitosamente',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar la tarea',
        error: error.message,
      });
    }
  },

  deleteAllTasksFromClassroom: async (req, res) => {
    const classroomId = req.params.classroomId;
    const idTask = req.params.idTask;

    try {
      const classroom = await Classrooms.findById(classroomId);

      if (!classroom) {
        return res
          .status(404)
          .json({ success: false, message: 'Aula no encontrada' });
      }

      for (const studentId of classroom.students) {
        const student = await Students.findById(studentId);

        if (student) {
          student.tasks = student.tasks.filter(
            (task) => task._id.toString() !== idTask,
          );
          await student.save();
        }
      }

      await Tasks.findOneAndDelete({ _id: idTask });

      return res
        .status(200)
        .json({ success: true, message: 'Tarea eliminada correctamente' });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar tareas del aula',
        error: error.message,
      });
    }
  },

  getTaskByStudent: async (req, res) => {
    const studentId = req.params.studentId;
    const idTask = req.params.idTask;

    try {
      const student = await Students.findById(studentId);

      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: 'Estudiante no encontrado' });
      }

      const task = student.tasks.find(
        (task) => task._id.toString() === idTask,
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada para este estudiante',
        });
      }

      return res.status(200).json({
        success: true,
        task: task,
        student: student,
        message: 'Tarea encontrada exitosamente',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al buscar la tarea',
        error: error.message,
      });
    }
  },
};

module.exports = taskController;
