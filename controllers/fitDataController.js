const FitDataGoogle = require('../models/fitData')
const Users = require('../models/admin')
const Students = require('../models/student')


const queryPopulateUser = [
    {
        path: 'user',
        select: 'name lastName age size weight role gender',
    },
    {
        path: 'student',
        select: 'name lastName age size weight role gender',
    },
];



const fitDataController = {

    registerFitData: async (req, res) => {

        try {
            const { steps, caloriesBurned, distance, heartRate, userType, user, student } = req.body

            const fitDataUser = new FitDataGoogle({
                steps,
                caloriesBurned,
                distance,
                heartRate,
                userType,
                user,
                student
            })
            await fitDataUser.save()
            if (userType === 'user') {

                const userData = await Users.findById(user)

                if (!userData) {
                    return res.status(401).json(
                        {
                            message: "El usuario no existe en la base de datos"
                        }
                    )
                }

                userData.fitData.push(fitDataUser._id)
                await userData.save()

            } else {
                const userData = await Students.findById(student)

                if (!userData) {
                    return res.status(401).json(
                        {
                            message: "El usuario no existe en la base de datos"
                        }
                    )
                }
                userData.fitData.push(fitDataUser._id)
                await userData.save()
            }

            if (fitDataUser) {
                res.status(200).json({
                    response: fitDataUser,
                    message: "Se ha registrado correctamente la data",
                    success: true
                })
            } else {
                res.status(404).json({
                    error: "Error al guardar los datos",
                    success: false
                })
            }



        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Error al registrar la actividad' })
        }

    },

    getFitDataByUser: async (req, res) => {

        try {

            const { id } = req.params
            const fitData = await FitDataGoogle.find({ user: id }).populate(queryPopulateUser)
            if (fitData) {
                res.status(200).json({
                    response: fitData,
                    success: true
                })
            } else {
                res.status(404).json({
                    error: "No se ha encontrado la data",
                    success: false
                })
            }

        } catch (error) {

        }

    },
    getFitData: async (req, res) => {


        try {

            const fitData = await FitDataGoogle.find()
            .populate(queryPopulateUser[0])  // Primera llamada a populate para 'user'
            .populate(queryPopulateUser[1]); 

            if (fitData) {
                res.status(200).json({
                    response: fitData,
                    success: true
                })
            } else {
                res.status(404).json({
                    error: "No se ha encontrado la data",
                    success: false
                })
            }

        } catch (error) {

            console.error(error)
            res.status(500).json({ error: 'Error al intentar obtener la data' })

        }


    },

    updateFitData: async (req, res) => {

        try {
            const { user, student, ...fitData } = req.body;
            let query = user ? { user, createdAt: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) } }
                : { student, createdAt: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) } };

            const existingFitData = await FitDataGoogle.findOne(query);

            if (existingFitData) {
                // Actualizar el registro existente
                Object.assign(existingFitData, fitData);
                await existingFitData.save();
                res.status(200).json({ response: existingFitData, message: "Data actualizada correctamente", success: true });
            } else {
                // No existe un registro para hoy, crear uno nuevo
                const fitDataUser = new FitDataGoogle({ ...fitData, user, student });
                await fitDataUser.save();
                res.status(200).json({ response: fitDataUser, message: "Data registrada correctamente", success: true });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al procesar la solicitud' });
        }

    }







}

module.exports = fitDataController