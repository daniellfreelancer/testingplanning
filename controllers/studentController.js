const Students = require('../models/student')
const bcryptjs = require('bcryptjs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto')

const bucketRegion = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET_NAME
const publicKey = process.env.AWS_PUBLIC_KEY
const privateKey = process.env.AWS_SECRET_KEY

const clientAWS = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: publicKey,
    secretAccessKey: privateKey,
  },
})

const quizIdentifier = () => crypto.randomBytes(32).toString('hex')

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
            workshop,
            program,
            school_representative,
            bio } = req.body

        try {

            let newStudent = await Students.findOne({ rut })

            if (!newStudent) {

                newStudent = await Students.findOne({ email })

                if (!newStudent) {
                    let role = "ESTU";
                    let logged = false;
                    let imgUrl

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
                        logged,
                        workshop,
                        program,
                        bio,
                        imgUrl
                    }).save()

                    if (req.file) {

                        const fileContent = req.file.buffer;
                        const extension = req.file.originalname.split('.').pop();
                        const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;

                        const uploadParams = {
                            Bucket: process.env.AWS_BUCKET_NAME,
                            Key: fileName,
                            Body: fileContent,

                        };

                        // Subir el archivo a S3
                        const uploadCommand = new PutObjectCommand(uploadParams);
                        await clientAWS.send(uploadCommand);

                        newStudent.imgUrl = fileName

                        // await newStudent.save()
                    }

                    await newStudent.save()

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

    },

}

module.exports = studentController