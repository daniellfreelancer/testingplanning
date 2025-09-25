const Training = require('../models/trainingApp')
const Users = require('../models/admin')
const Students = require('../models/student')


const trainingPopulateQuery = [
    {
        path: 'user',
        select: 'name lastName age size weight role gender',
    },
    {
        path: 'student',
        select: 'name lastName age size weight role gender',
    },
]

const trainingAppController = {

    createTraining: async (req, res) => {

        try {
            let training = await new Training(req.body).save()

            if (training) {
                res.status(200).json({
                    success: true,
                    data: training
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: "Error al crear el entrenamiento"
                })
            }


        } catch (error) {
            console.log(error)
            res.status(400).json({
                success: false,
                message: error.message
            })

        }
    },
    getTrainingList: async (req, res) => {
        try {
            let trainings = await Training.find().populate(trainingPopulateQuery)

            if (trainings) {
                res.status(200).json({
                    success: true,
                    data: trainings
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: "No hay entrenamientos registrados"
                })
            }

        } catch (error) {
            console.log(error)
            res.status(400).json({
                success: false,
                message: error.message
            })

        }
    },
    getTrainingListByUser: async (req, res) => {
        let { id, typeUser } = req.params

        try {

            if (typeUser === 'user') {
                let user = await Users.findById(id)

                if (user) {
                    let trainings = await Training.find({ user: user._id }).sort({ createdAt: -1 })

                    if (trainings) {
                        res.status(200).json({
                            success: true,
                            data: trainings
                        })
                    } else {
                        res.status(400).json({
                            success: false,
                            message: "No hay entrenamientos registrados para este usuario"
                        })
                    }
                } else {
                    res.status(400).json({
                        success: false,
                        message: "Usuario no encontrado"
                    })
                }
            } else {
                let student = await Students.findById(id)

                if (student) {
                    let trainings = await Training.find({ student: student._id }).sort({ createdAt: -1 })

                    if (trainings) {
                        res.status(200).json({
                            success: true,
                            data: trainings
                        })
                    } else {
                        res.status(400).json({
                            success: false,
                            message: "No hay entrenamientos registrados para este estudiante"
                        })
                    }
                } else {
                    res.status(400).json({
                        success: false,
                        message: "Estudiante no encontrado"
                    })
                }
            }


        } catch (error) {
            console.log(error)
            res.status(400).json({
                success: false,
                message: error.message
            })

        }
    },
    getTrainingById: async (req, res) => {
        let { trainingId } = req.params

        try {
            let training = await Training.findById(trainingId).populate(trainingPopulateQuery)

            if (training) {
                res.status(200).json({
                    success: true,
                    data: training
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: "No se encontró el entrenamiento"
                })
            }

        } catch (error) {
            console.log(error)
            res.status(400).json({
                success: false,
                message: error.message
            })

        }
    },
    getTrainingByListOnlyStudents : async (req, res) => {
        try {
            let trainings = await Training.find({ student: { $ne: null } }).populate(trainingPopulateQuery).sort({ createdAt: -1 })

            if (trainings) {
                res.status(200).json({
                    success: true,
                    data: trainings
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: "No hay entrenamientos registrados"
                })
            }

        } catch (error) {
            console.log(error)
            res.status(400).json({
                success: false,
                message: error.message
            })

        }
    }

}

module.exports = trainingAppController