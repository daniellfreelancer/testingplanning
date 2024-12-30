const Students = require('../models/student')
const bcryptjs = require('bcryptjs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto')
const Tasks = require('../models/tasks')
const Classrooms = require('../models/classroom')
const Workshops = require('../models/workshop')

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


const studentQueryPopulate = [
    {
        path: 'classroom school workshop program tasks',
        select: 'grade level section name  title description fileStudent status classroom notation teacher dueDate'

    }
]


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
            bio, 
            from,
            role
         } = req.body

        try {

            if (from !== 'form') {
                return res.status(400).json({
                    message: "No se puede crear su cuenta, por favor contacte a su administrador",
                    success: false
                })
            }
            let temporalPassword = "vitalmove"

            let newStudent = await Students.findOne({ rut })

            if (!newStudent) {

                newStudent = await Students.findOne({ email })

                if (!newStudent) {
                //    let role = "ESTU";
                    let logged = false;
                    let imgUrl
                    let tasks = []
                    let verified = true;

                    password = password.length > 0 ? bcryptjs.hashSync(password, 10) : bcryptjs.hashSync(temporalPassword, 10);
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
                        imgUrl,
                        tasks,
                        verified,
                        role
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

                    if (newStudent.from.includes(from)) {
                        return res.status(400).json({
                            message: "El email ingresado ya existe en nuestra base de datos",
                            success: false
                        })
                    } else {
                        newStudent.from.push(from)
                        adminUser.password.push(bcryptjs.hashSync(password, 10));
                        await newStudent.save()
                        res.status(201).json({
                            message: "Estudiante ha creado su cuenta desde: " + from,
                            success: true
                        });
                    }
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
    getStudentDetail: async (req, res) => {
        let id = req.params.id

        try {

            const student = await Students.findById(id).populate(studentQueryPopulate)

            if (!student) {
                return res.status(404).json({
                    message: "Estudiante no encontrado",
                    success: false
                });
            }

            res.status(200).json({
                student,
                message: "Estudiante encontrado",
                success: true
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al obtener el detalle del estudiante",
            });
        }
    },
    // updateTask: async (req, res) => {
    //     const studentId = req.params.studentId;
    //     const taskId = req.params.taskId;

    //     try {
    //         // Buscar al estudiante
    //         const student = await Students.findById(studentId)

    //         if (!student) {
    //             return res.status(404).json({
    //                 message: "Estudiante no encontrado",
    //             });
    //         }

    //         let arraytasks = student.tasks

    //         // Buscar la tarea en el array tasks del estudiante
    //         const taskIndex =  arraytasks._id.findIndex(task => task.toString() === taskId);

    //         if (taskIndex === -1) {
    //             return res.status(404).json({
    //                 message: "Tarea no encontrada en el array de tareas del estudiante",
    //             });
    //         }

    //         console.log(taskIndex)

    //         const task = student.tasks[taskIndex];

    //         // Subir el archivo a S3 si se proporciona
    //         if (req.file) {
    //             const fileContent = req.file.buffer;
    //             const extension = req.file.originalname.split('.').pop();
    //             const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;

    //             const uploadParams = {
    //                 Bucket: process.env.AWS_BUCKET_NAME,
    //                 Key: fileName,
    //                 Body: fileContent,
    //             };

    //             // Subir el archivo a S3
    //             const uploadCommand = new PutObjectCommand(uploadParams);
    //             await clientAWS.send(uploadCommand);

    //             task.fileStudent = fileName; // Guardar el nombre del archivo en el campo fileStudent
    //         }

    //         task.status = 'DONE'; // Cambiar el estado a DONE

    //         await student.save();

    //         res.status(200).json({
    //             message: "Tarea actualizada exitosamente",
    //             response: task,
    //             success: true
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({
    //             message: "Error al actualizar la tarea",
    //         });
    //     }
    // },
    updateTask: async (req, res) => {
        const studentId = req.params.studentId;
        const taskId = req.params.taskId;

        try {
            // Buscar al estudiante
            const student = await Students.findById(studentId);

            if (!student) {
                return res.status(404).json({
                    message: "Estudiante no encontrado",
                });
            }

            // Buscar y actualizar la tarea en el array tasks del estudiante
            const taskIndex = student.tasks.findIndex(task => task._id.toString() === taskId);

            if (taskIndex === -1) {
                return res.status(404).json({
                    message: "Tarea no encontrada en el array de tareas del estudiante",
                });
            }

            const task = student.tasks[taskIndex];

            // Subir el archivo a S3 si se proporciona
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

                task.fileStudent = fileName; // Guardar el nombre del archivo en el campo fileStudent
            }

            task.status = 'DONE'; // Cambiar el estado a DONE

            await student.save();

            res.status(200).json({
                response: student,
                message: "Tarea actualizada exitosamente",
                success: true
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al actualizar la tarea",
            });
        }
    },

    findTaskByStudent: async (req, res) => {
        const studentId = req.params.studentId; // Obtener el id del estudiante de los parámetros de la solicitud
        const idTask = req.params.idTask; // Obtener el id de la tarea de los parámetros de la solicitud

        try {
            // Buscar al estudiante por su _id
            const student = await Students.findById(studentId);

            if (!student) {
                return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
            }

            // Buscar la tarea dentro del array de tasks del estudiante
            const task = student.tasks.find(task => task._id.toString() === idTask);

            if (!task) {
                return res.status(404).json({ success: false, message: 'Tarea no encontrada para este estudiante' });
            }

            return res.status(200).json({ success: true, task: task, message: 'Estudiante y tarea encontrados' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al buscar el estudiante y la tarea', error: error.message });
        }
    },
    updateTaskById: async (req, res) => {
        const studentId = req.params.studentId; // Obtener el id del estudiante de los parámetros de la solicitud
        const idTask = req.params.idTask; // Obtener el id de la tarea de los parámetros de la solicitud
        const updatedTaskData = req.body; // Datos para actualizar la tarea

        try {
            // Buscar al estudiante por su _id
            const student = await Students.findById(studentId);

            if (!student) {
                return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
            }

            // Buscar la tarea dentro del array de tasks del estudiante
            const taskIndex = student.tasks.findIndex(task => task._id.toString() === idTask);

            if (taskIndex === -1) {
                return res.status(404).json({ success: false, message: 'Tarea no encontrada para este estudiante' });
            }

            // Actualizar los valores de la tarea con los datos proporcionados en req.body
            student.tasks[taskIndex] = { ...student.tasks[taskIndex], ...updatedTaskData };

            // Manejar la carga de archivos si se proporciona un file en el body
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

                student.tasks[taskIndex].fileStudent = fileName; // Actualizar el campo fileStudent
            }

            // Guardar los cambios en la base de datos
            await student.save();

            return res.status(200).json({ success: true, task: student.tasks[taskIndex], message: 'Tarea actualizada exitosamente' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al actualizar la tarea', error: error.message });
        }
    },
    getStudentsByfilter: async (req, res) => {

        try {

            const filterType = req.query.filterType
            const filterValue = req.query.filterValue
            const limit = parseInt(req.query.limit) || 0; // 0 significa sin límite
            let options = {
                path: 'students',
                select: 'name lastName imgUrl logged size age email phone',
                options: {
                    sort: { 'lastName': 1 },
                    limit: limit // Aplicar el límite aquí
                }
            };

            if (filterType === 'classroom') {

                const classroom = await Classrooms.findById(filterValue)
                .populate(options);

                if (classroom) {

                    res.status(200).json({
                        success: true,
                        response: classroom.students
                    })

                } else {
                    return res.status(404).json({
                        success: false,
                        message: "No se encontraron estudiantes"
                    });
                }
            }
            if (filterType === 'workshop') {

                const workshop = await Workshops.findById(filterValue)
                .populate(options);


                if (workshop) {
                    res.status(200).json({
                        success: true,
                        response: workshop.students,
                    })
                } else {
                    return res.status(404).json({
                        success: false,
                        message: "No se encontraron estudiantes"
                    });
                }
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: 'Error al intentar traer los estudiantes' });
        }

    },
    getStudents : async (req, res) => {

        try {
            
            const students = await Students.find()

            if ( students ) {
                res.status(200).json({
                    success: true,
                    response: students
                    })
            } else {
                return res.status(404).json({
                    success: false,
                    message: "No se encontraron estudiantes"
                    });
            }


        } catch (error) {

            console.log(error)
            return res.status(500).json({ message: 'Error al intentar traer los estudiantes' });
            
        }


    }


}

module.exports = studentController