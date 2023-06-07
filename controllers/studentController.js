const Students = require('../models/student')
const bcryptjs = require('bcryptjs');

const studentController = {

    create: async (req, res) => {
        let {
            rut,
            password,
            name,
            lastName,
            age,
            weight,
            size,
            classroom,
            school,
            email,
            phone,
            gender,
            school_representative } = req.body
            let { filename } = req.file

        try {

            let newStudent = await Students.findOne({ rut })

            if (!newStudent) {

                newStudent = await Students.findOne({ email })

                if (!newStudent) {
                    let role = "ESTU";
                    let logged = false;
                    
                    password = bcryptjs.hashSync(password, 10)
                    newStudent = await new Students({
                        rut,
                        password,
                        name,
                        lastName,
                        age,
                        weight,
                        size,
                        classroom,
                        school,
                        email,
                        phone,
                        gender,
                        school_representative,
                        role,
                        logged
                    }).save()

                    if (filename) {
                        newStudent.imgUrl = filename

                        await newStudent.save()
                    }


                    res.status(200).json({
                        response: newStudent,
                        message: 'Estudiante creado con exito',
                        success: true
                    })

                } else {
                    res.status(400).json({
                        message: "El email ingresado ya existe en nuestra base de datos",
                        success: false
                    })
                }


            } else {
                res.status(400).json({
                    message: "Estudiante ya existe en la base de datos, verifica tu numero de RUT",
                    success: false
                })
            }

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: error.message, success: false })
        }

    }

}

module.exports = studentController