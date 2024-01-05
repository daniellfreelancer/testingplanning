const FitDataGoogle = require('../models/fitData')
const Users = require('../models/admin')
const Students = require('../models/student')



const queryPopulateUser = [
    {
        path: 'user student',
        select: 'name lastName age size weight role gender'
    }
]


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
                const userData  = await Students.findById(student)

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

        }
    }

module.exports = fitDataController