const Smartwatch = require('../models/dusunSM')



const dusunSMController = {

    registerData: async (req, res) => {

        try {

            let smartwatchRegister = await new Smartwatch(req.body).save()

            if (smartwatchRegister) {

                res.status(200).json({
                    message: "Data registrada con exito",
                    data: smartwatchRegister,
                    succes: true
                })


            } else {
                res.status(400).json({
                    message: "no se ha podido registrar la data",
                    succes: false
                })
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Se ha producido un error  ",
                succes: false
            })

        }
    },
    getAllData: async (req, res) => {
        try {
            let allData = await Smartwatch.find()
            if (allData) {
                res.status(200).json({
                    message: "Datos encontrados",
                    data: allData,
                    succes: true
                })
            } else {
                res.status(400).json({
                    message: "No se han encontrado datos",
                    succes: false
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Se ha producido un error",
                succes: false
            })

        }
    },
    getBleAddress: async (req, res) => {
        try {
            let { ble_addr } = req.body
            let data = await Smartwatch.find({ ble_addr: ble_addr })
            if (data) {
                res.status(200).json({
                    message: "Datos encontrados",
                    data: data,
                    succes: true
                })
            } else {
                res.status(400).json({
                    message: "No se han encontrado datos",
                    succes: false
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Se ha producido un error",
                succes: false
            })
        }
    },
    deleteData: async (req, res) => {
        try {
            let { id } = req.params
            let data = await Smartwatch.findByIdAndRemove(id)
            if (data) {
                res.status(200).json({
                    message: "Datos eliminados",
                    succes: true
                })
            } else {
                res.status(400).json({
                    message: "No se han encontrado datos",
                    succes: false
                })
            }


        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Se ha producido un error",
                succes: false
            })
        }

    }

}

module.exports = dusunSMController