const Schools = require('../models/school')


const schoolControllers = {

    createSchool : async (req, res) =>{

        try {

            const newSchool = await new Schools(req.body).save()

            if (newSchool) {
                res.status(200).json({
                    message: "Escuela creada con exito",
                    response: newSchool,
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "Error al crear escuela",
                    success: false
                })
            }

            
        } catch (error) {
            console.log(error)
            res.status(400).json({
                message: error.message,
                success: false
            })
        }

    }


}

module.exports = schoolControllers