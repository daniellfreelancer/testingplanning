const Students = require('../models/student')


const studentController = {

    create: async (req, res) => {
        let {rut} = req.body

        try {

            let newStudent = await Students.findOne({rut})

            if (!newStudent){

                newStudent = await new Students(req.body).save()

                res.status(200).json(newStudent)

            } else {
                res.status(200).json({
                    message:"Estudiante ya existe en la base de datos, verifica tu numero de RUT",
                    success: false
                }) 
            }

        } catch (error) {
            console.log(error)
            res.status(400).json({message: error.message, success: false})
        }

    }

}

module.exports = studentController