const WorkshopReport = require('../models/reportByWorkshop')



const  queryPopulate = [
    {
        path: 'institution workshop',
        select:'name address phone'
    }
]


const workshopReport = {

    createReport: async (req, res) => {

        try {

            const report = await new WorkshopReport(req.body).save()

            if (report) {
                return res.status(200).json({
                    message: "Reporte creado con exito",
                    data: report
                })
            } else {

                return res.status(400).json({
                    message: "Error al crear el reporte"
                })

            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Error al crear el reporte"
            })
        }

    },
    getReports: async (req, res) => {
        try {

            const reports = await WorkshopReport.find().populate(queryPopulate)

            if (reports) {

                res.status(200).json({
                    message: "Reportes obtenidos con exito",
                    data: reports
                })


            } else {
                res.status(400).json({
                    message: "No se encontraron reportes"
                })
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Error al obtener los reportes"
            })
        }
    },
    getReportbyId: async (req, res) => {

        const { id } = req.params

        try {

            const report = await WorkshopReport.findById(id)

            if (report) {
                res.status(200).json({
                    message: "Reporte obtenido con exito",
                    data: report
                })
            } else {
                res.status(400).json({
                    message: "No se encontró el reporte"
                })

            }



        } catch (error) {
            console.log(error)

            res.status(500).json({
                message: "Error al obtener el reporte"
            })

        }
    },
    deleteReportById: async (req, res) => {

        const { id } = req.params
        try {

            const report = await WorkshopReport.findByIdAndDelete(id)

            if (report) {
                res.status(200).json({
                    message: "Reporte eliminado con exito",
                })
            } else {
                res.status(400).json({
                    message: "No se encontró el reporte"
                })
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Error al eliminar el reporte"
            })

        }
    },
    getReportByTeacher: async (req, res) => {

        const { id } = req.params;

        try {
            const reports = await WorkshopReport.find({ reportedBy: id }).populate(queryPopulate);

            if (reports.length === 0) {
                return res.status(404).json({ message: 'No ha realizado ningun reporte' });
            }

            res.status(200).json({
                message: 'Reportes encontrados',
                data: reports
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: 'Error al obtener los reportes'
            });
        }




    },
    getReportByWorkshop: async (req, res) => {

        const { id } = req.params; // Obtener el ID del workshop

        try {

            const reports = await WorkshopReport.find({ workshop: id }).populate(queryPopulate)

            if (reports.length === 0) {
                return res.status(404).json({ message: 'No ha realizado ningun reporte para este taller' });
            } else {
                res.status(200).json({
                    message: 'Reportes encontrados',
                    data: reports
                });
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: 'Error al obtener los reportes'
            });
        }
    },
    getReportsByInstitution: async (req, res) => {


        const { id } = req.params

        try {
            const reports = await WorkshopReport.find({ institution: id }).populate(queryPopulate)

            if (reports) {
                res.status(200).json({
                    message: 'Reportes encontrados',
                    data: reports
                });
            } else {
                return res.status(404).json({
                    message: 'No ha realizado ningun reporte para esta institucion'
                });
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: 'Error al obtener los reportes'
            });
        }
    }
}

module.exports = workshopReport