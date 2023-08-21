const Notes = require('../models/gradebook')
const Teacher = require('../models/admin')
const Classrooms = require('../models/classroom')
const Students = require('../models/student')



const gradebookController = {


    createNote: async (req, res) => {
        let { title, classroom, notation, teacher, student } = req.body;

        try {
            // Crear la nueva calificación
            const newNote = new Notes({
                title,
                notation,
                teacher,
                student,
                classroom
            });
            // Guardar la calificación en la base de datos
            await newNote.save();

            // Buscar la información del aula
            const classroomInfo = await Classrooms.findById(classroom);

            if (!classroomInfo) {
                return res.status(400).json({
                    message: "Aula no encontrada",
                });
            }
            // Buscar el estudiante en el aula por su _id
            const studentInfo = classroomInfo.students.find(studentObj => studentObj._id.toString() === student);

            if (!studentInfo) {
                return res.status(400).json({
                    message: "Estudiante no encontrado en el aula",
                });
            }

            // Agregar la calificación al campo gradebook del estudiante
            await Students.findByIdAndUpdate(studentInfo._id, {
                $push: { gradebook: newNote },
            });

            res.status(200).json({
                response: newNote,
                student: studentInfo,
                message: "Calificación creada y asignada al estudiante",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al crear y asignar la calificación",
            });
        }
    },
    deleteNote: async (req, res) => {
        const { idStudent, idGradebook } = req.body;

        try {
            // Buscar el estudiante por idStudent
            const student = await Students.findOne({ _id: idStudent });

            if (!student) {
                return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
            }

            // Eliminar el objeto del gradebook
            student.gradebook = student.gradebook.filter(item => item._id.toString() !== idGradebook);

            // Guardar los cambios en el estudiante
            await student.save();

            // Eliminar la nota correspondiente
            await Notes.findOneAndDelete({ _id: idGradebook });

            res.json({ success: true, message: 'Elemento eliminado exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Hubo un error en el servidor' });
        }
    },
    updateNote: async (req, res) => {
        const studentId = req.params.studentId; // Obtener el id del estudiante de los parámetros de la solicitud
        const idNote = req.params.idNote; // Obtener el id de la nota de los parámetros de la solicitud
        const updatedNoteData = req.body; // Datos para actualizar la nota

        try {
            // Buscar al estudiante por su _id
            const student = await Students.findById(studentId);

            if (!student) {
                return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
            }

            // Buscar la nota dentro del array de gradebook del estudiante
            const noteIndex = student.gradebook.findIndex(note => note._id.toString() === idNote);

            if (noteIndex === -1) {
                return res.status(404).json({ success: false, message: 'Nota no encontrada para este estudiante' });
            }

            // Actualizar los valores de la nota con los datos proporcionados en req.body
            student.gradebook[noteIndex] = { ...student.gradebook[noteIndex], ...updatedNoteData };

            // Guardar los cambios en la base de datos
            await student.save();

            const note = await Notes.findByIdAndUpdate({ _id: idNote }, updatedNoteData);

            if (!note) {
                return res.status(404).json({ success: false, message: 'Calificación no encontrada' });
            }

            return res.status(200).json({ success: true, note: student.gradebook[noteIndex], message: 'Nota actualizada exitosamente' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al actualizar la nota', error: error.message });
        }
    },
    getNoteById: async (req, res) => {
        const idNote = req.params.idNote;

        try {
            const note = await Notes.findById(idNote);

            if (!note) {
                return res.status(404).json({ success: false, message: 'Nota no encontrada' });
            }

            res.json({ success: true, note });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error en el servidor' });
        }
    },
    getAllNotes: async (req, res) => {
        try {
            const notes = await Notes.find();
            res.json({ success: true, notes });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error en el servidor' });
        }
    },
    getNotesByClassroom: async (req, res) => {
        const classroomId = req.params.classroomId;

        try {
            const notes = await Notes.find({ classroom: classroomId });
            res.json({ success: true, notes });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error en el servidor' });
        }
    },
}


module.exports = gradebookController