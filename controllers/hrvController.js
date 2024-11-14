const HRV =  require('../models/hrv')



const hrvController = {

    //agregar registro de hrv
    addHRV : async (req, res) => {

        try {

            let newHRV = await new HRV(req.body).save()

            if (newHRV) {
                res.status(200).json({
                    message: "Registro de HRV registrado con éxito",
                    success: true,
                })
            } else {
                res.status(400).json({
                    message: "Error al registrar el HRV",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },
    // obtener todos los registros de hrv
    getHRVs : async (req, res) => {

        try {

            let hrvList = await HRV.find()

            if (hrvList) {
                res.status(200).json({
                    message: "Listado de HRVs",
                    success: true,
                    data: hrvList,
                })
            } else {
                res.status(404).json({
                    message: "No se encontraron HRVs",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },
    // obtener un registro de hrv por id
    getHRVById : async (req, res) => {

        try {

            let hrv = await HRV.findById(req.params.id)

            if (hrv) {
                res.status(200).json({
                    message: "HRV encontrado",
                    success: true,
                    data: hrv,
                })
            } else {
                res.status(404).json({
                    message: "No se encontró el HRV",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },
    // borrar un registro hrv
    deleteHRV : async (req, res) => {

        try {

            let hrv = await HRV.findByIdAndDelete(req.params.id)

            if (hrv) {
                res.status(200).json({
                    message: "HRV eliminado con éxito",
                    success: true,
                })
            } else {
                res.status(404).json({
                    message: "No se encontró el HRV",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },
    // obtener los registros historios de un student
    getHRVsHistoryByStudentId : async (req, res) => {

        try {

            let hrvList = await HRV.find({ student: req.params.studentId })

            if (hrvList) {
                res.status(200).json({
                    message: "Listado de HRVs del estudiante",
                    success: true,
                    data: hrvList,
                })
            } else {
                res.status(404).json({
                    message: "No se encontraron HRVs para el estudiante",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },
    // obtener los registros historios de un user
    getHRVsHistoryByUser : async (req, res) => {

        try {

            let hrvList = await HRV.find({ user: req.params.userId })

            if (hrvList) {
                res.status(200).json({
                    message: "Listado de HRVs del usuario",
                    success: true,
                    data: hrvList,
                })
            } else {
                res.status(404).json({
                    message: "No se encontraron HRVs para el usuario",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },
    // obtener los registros historicos de un dispositivo
    getHRVsHistoryByDevice : async (req, res) => {

        try {

            let hrvList = await HRV.find({ device: req.params.macAddress })

            if (hrvList) {
                res.status(200).json({
                    message: "Listado de HRVs del dispositivo",
                    success: true,
                    data: hrvList,
                })
            } else {
                res.status(404).json({
                    message: "No se encontraron HRVs para el dispositivo",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },

}

module.exports = hrvController