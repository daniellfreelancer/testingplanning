const Programs = require('../../models/program');
const Workshops = require('../../models/workshop');
const Students = require('../../models/student');
const mongoose = require('mongoose');

const servicesController = {

    cleanStudentsProgramAndWorkshop: async (req, res) => {
        try {
            const { programId } = req.params;

            if (!programId || !mongoose.Types.ObjectId.isValid(programId)) {
                return res.status(400).json({
                    message: 'programId inválido',
                    success: false
                });
            }

            const program = await Programs.findById(programId)
                .select('students workshops')
                .populate([
                    {
                        path: 'workshops',
                        select: 'students'
                    }
                ]);

            if (!program) {
                return res.status(404).json({
                    message: 'Programa no encontrado',
                    success: false
                });
            }

            const programStudentIds = (program.students || []).map(s => (s?._id ?? s).toString());
            const workshopDocs = program.workshops || [];
            const workshopIds = workshopDocs.map(w => (w?._id ?? w).toString());
            const workshopStudentIds = workshopDocs
                .flatMap(w => (w?.students || []).map(s => (s?._id ?? s).toString()));

            const studentIdsToClean = Array.from(new Set([...programStudentIds, ...workshopStudentIds]));

            if (studentIdsToClean.length === 0) {
                return res.status(200).json({
                    message: 'No hay estudiantes que limpiar en este programa/talleres',
                    success: true,
                    response: {
                        programId,
                        workshopCount: workshopIds.length,
                        studentsRemovedFromProgram: 0,
                        studentsRemovedFromWorkshops: 0,
                        studentsDeleted: 0
                    }
                });
            }

            const [workshopsUpdateResult, programUpdateResult, deleteResult] = await Promise.all([
                workshopIds.length
                    ? Workshops.updateMany(
                        { _id: { $in: workshopIds } },
                        { $pull: { students: { $in: studentIdsToClean } } }
                    )
                    : Promise.resolve({ modifiedCount: 0, matchedCount: 0 }),
                Programs.updateOne(
                    { _id: programId },
                    { $pull: { students: { $in: studentIdsToClean } } }
                ),
                Students.deleteMany({ _id: { $in: studentIdsToClean } })
            ]);

            return res.status(200).json({
                message: 'Limpieza completada: estudiantes removidos de programa/talleres y eliminados',
                success: true,
                response: {
                    programId,
                    workshopCount: workshopIds.length,
                    studentsTargetedUnique: studentIdsToClean.length,
                    studentsFoundInProgram: programStudentIds.length,
                    studentsFoundInWorkshops: workshopStudentIds.length,
                    workshopsMatched: workshopsUpdateResult?.matchedCount ?? null,
                    workshopsModified: workshopsUpdateResult?.modifiedCount ?? null,
                    programMatched: programUpdateResult?.matchedCount ?? null,
                    programModified: programUpdateResult?.modifiedCount ?? null,
                    studentsDeleted: deleteResult?.deletedCount ?? null
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                message: error?.message || 'Error al limpiar estudiantes del programa/talleres',
                success: false
            });
        }
    }

}

module.exports = servicesController;