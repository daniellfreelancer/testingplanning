const Medical = require('../models/medicalRegister')

const medicalController = {

    createRegister: async (req, res) => {

        try {

            const register = new Medical(req.body)
            await register.save()

            if (register) {
                res.status(200).json({
                    message: "Registro creado con exito",
                    data: register,
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "No se pudo crear el registro",
                    success: false
                })
            }

        } catch (error) {

            console.log(error)
            res.status(500).json({
                message: error.message,
                success: false
            })
        }
    },
    getAllRegisters: async (req, res) => {
        try {

            const registers = await Medical.find({})
               .populate('user', 'name lastName email age size weight')
               .populate('student', 'name lastName email age size weight')
               .populate('institution', 'name')

            if (registers) {
                res.status(200).json({
                    message: "Registros obtenidos con éxito",
                    data: registers,
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "No se encontraron registros",
                    success: false
                })
            }

        } catch (error) {

            console.log(error)
            res.status(500).json({
                message: error.message,
                success: false
            })
        }
    },
    getRegisterById: async (req, res) => {

        try {

            const register = await Medical.findById(req.params.id)
               .populate('user', 'name lastName email age size weight')
               .populate('student', 'name lastName email age size weight')
               .populate('institution', 'name')
               .exec()

            if (register) {
                res.status(200).json({
                    message: "Registro obtenido con éxito",
                    data: register,
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "No se encontró el registro",
                    success: false
                })
            }

        } catch (error) {

            console.log(error)
            res.status(500).json({
                message: error.message,
                success: false
            })
        }
    },
    getRegisterByRut : async (req, res) => {

        try {
            const register = await Medical.findOne({ rut: req.params.rut })
               .populate('user', 'name lastName email age size weight')
               .populate('student', 'name lastName email age size weight')
               .populate('institution', 'name')
               .exec()

            if (register) {
                res.status(200).json({
                    message: "Registro obtenido con éxito",
                    data: register,
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "No se encontró el registro",
                    success: false
                })
            }

        } catch (error) {
            
        }

    },
    updateRegister: async (req, res) => {
        try {

            const register = await Medical.findByIdAndUpdate(req.params.id, req.body, { new: true })
               .populate('user', 'name lastName email age size weight')
               .populate('student', 'name lastName email age size weight')
               .populate('institution', 'name')
               .exec()

            if (register) {
                res.status(200).json({
                    message: "Registro actualizado con éxito",
                    data: register,
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "No se encontró el registro",
                    success: false
                })
            }

        } catch (error) {

            console.log(error)
            res.status(500).json({
                message: error.message,
                success: false
            })
        }
    },
    deleteRegister :async (req, res) => {
        try {

            const register = await Medical.findByIdAndDelete(req.params.id)

            if (register) {
                res.status(200).json({
                    message: "Registro eliminado con éxito",
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "No se encontró el registro",
                    success: false
                })
            }

        } catch (error) {

            console.log(error)
            res.status(500).json({
                message: error.message,
                success: false
            })
        }
    },


}

module.exports = medicalController