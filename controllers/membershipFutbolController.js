const Membership = require('../models/membershipFutbol')
const { S3Client, PutObjectCommand, PutObjectRetentionCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto')
const sharp = require('sharp');
const Institution = require('../models/institution')
const Club = require('../models/club')
const Player = require('../models/student')

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


const membershipController = {

    // async createMembership(req, res) {
    //     const { year, institutionId, amount } = req.params;

    //     try {
    //         // Buscar la institución por su ID
    //         const institution = await Institution.findById(institutionId)
    //         if (!institution) {
    //             return res.status(404).json({ message: 'Institución no encontrada' });
    //         }

    //         /**
    //          * Status
    //          * pendiente
    //          * rechazado
    //          * pagado
    //          * en revision
    //          * no activo
    //          * activo
    //          */

    //         // Crear membresías para cada estudiante en cada club
    //         const memberships = [];

    //         for (const club of institution.clubs) {
    //             for (const student of club.students) {
    //                 const membership = new Membership({
    //                     student: student._id,
    //                     year: year,
    //                     club: club._id,
    //                     institution: institution._id,
    //                     amount: amount,
    //                     january: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null,paymentPrice: null  },
    //                     february: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                     march: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                     april: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                     may: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                     june: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                     july: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                     august: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                     september: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                     october: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                     november: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                     december: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  }
    //                 });

    //                 memberships.push(membership.save());
    //             }
    //         }




    //         return res.status(201).json({ message: 'Membresías creadas exitosamente', memberships });
     
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ message: 'Error al crear las membresías', error });
    //     }
    // }
    // async createMembership(req, res) {
    //     const { year, institutionId, amount } = req.params;

    //     try {
    //         // Buscar la institución por su ID y poblar los clubes y sus estudiantes
    //         const institution = await Institution.findById(institutionId).populate({
    //             path: 'clubs',
    //             populate: {
    //                 path: 'students', // Asegúrate de que el modelo de Club tenga una referencia a los estudiantes
    //                 model: 'student' // Asegúrate de que el modelo de estudiantes esté correctamente referenciado
    //             }
    //         });

    //         if (!institution) {
    //             return res.status(404).json({ message: 'Institución no encontrada' });
    //         }

    //         // Crear membresías para cada estudiante en cada club
    //         const memberships = [];

    //         for (const club of institution.clubs) {
    //             // Verificar si club.students es un array
    //             if (Array.isArray(club.students)) {
    //                 for (const student of club.students) {
    //                     const membership = new Membership({
    //                         student: student._id,
    //                         year: year,
    //                         club: club._id,
    //                         institution: institution._id,
    //                         amount: amount,
    //                         statusMembership:"activo",
    //                         january: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null,paymentPrice: null  },
    //                         february: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                         march: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                         april: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                         may: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                         june: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                         july: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                         august: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                         september: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                         october: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                         november: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
    //                         december: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  }
    //                     });

    //                     memberships.push(membership.save());
    //                 }
    //             } else {
    //                 console.warn(`Club ${club.name} no tiene estudiantes o no es un array.`);
    //             }
    //         }

    //         // Esperar a que todas las membresías se guarden
    //         const savedMemberships = await Promise.all(memberships);

    //         return res.status(201).json({ message: 'Membresías creadas exitosamente', memberships: savedMemberships });
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ message: 'Error al crear las membresías', error });
    //     }
    // },
    async createMembershipNewMembers(req, res) {
        const { clubId, year, amount } = req.params;

        try {
            // Buscar el club por su ID y poblar los estudiantes
            const club = await Club.findById(clubId).populate('students');

            if (!club) {
                return res.status(404).json({ message: 'Club no encontrado' });
            }

            // Obtener las membresías existentes para el año especificado
            const existingMemberships = await Membership.find({ club: clubId, year });

            // Crear un conjunto de IDs de estudiantes con membresías existentes
            const existingStudentIds = new Set(existingMemberships.map(membership => membership.student.toString()));

            // Crear nuevas membresías para estudiantes que no tienen
            const membershipsToCreate = [];

            for (const student of club.students) {
                if (!existingStudentIds.has(student._id.toString())) {
                    const newMembership = new Membership({
                        student: student._id,
                        year: year,
                        club: club._id,
                        institution: club.institution, // Asegúrate de que el club tenga la referencia a la institución
                        amount: amount,
                        statusMembership:"activo",
                        january: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null,paymentPrice: null  },
                        february: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
                        march: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
                        april: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
                        may: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
                        june: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
                        july: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
                        august: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
                        september: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
                        october: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
                        november: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  },
                        december: { status: 'pendiente', recipe: null, paymentType: null, paymentDate:null, paymentPrice: null  }
                    });

                    membershipsToCreate.push(newMembership.save());
                }
            }

            // Guardar todas las nuevas membresías
            const savedMemberships = await Promise.all(membershipsToCreate);

            return res.status(201).json({ message: 'Membresías creadas exitosamente', memberships: savedMemberships });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al crear las membresías', error });
        }
    },
    async updateStatus(req, res) {
        const { membershipId } = req.params;
        const {status, month, paymentType, paymentPrice} = req.body

        try {
            // Buscar la membresía por ID
            const membership = await Membership.findById(membershipId);
            if (!membership) {
                return res.status(404).json({ message: 'Membresía no encontrada' });
            }

            // Verificar si el mes es válido
            const validMonths = [
                'january', 'february', 'march', 'april', 'may', 'june',
                'july', 'august', 'september', 'october', 'november', 'december'
            ];

            if (!validMonths.includes(month)) {
                return res.status(400).json({ message: 'Mes no válido' });
            }

            // Actualizar el estado del mes correspondiente
            membership[month].status = status;
            membership[month].paymentType = paymentType;
            membership[month].paymentPrice = paymentPrice;

            // Guardar los cambios en la base de datos
            await membership.save();

            return res.status(200).json({ message: 'Estado actualizado exitosamente', membership });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al actualizar el estado', error });
        }
    },
    async updatePayment(req, res) {
        const { studentId, year, month, status } = req.body;

        try {
            // Buscar la membresía por studentId y year
            const membership = await Membership.findOne({ student: studentId, year });
            if (!membership) {
                return res.status(404).json({ message: 'Membresía no encontrada' });
            }

            // Verificar si el mes es válido
            const validMonths = [
                'january', 'february', 'march', 'april', 'may', 'june',
                'july', 'august', 'september', 'october', 'november', 'december'
            ];

            if (!validMonths.includes(month)) {
                return res.status(400).json({ message: 'Mes no válido' });
            }

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

                // Actualizar el campo recipe con la URL de la imagen
                membership[month].recipe = fileName;
            }

            // Actualizar el campo paymentDate con la fecha actual
            membership[month].paymentDate = new Date();
            membership[month].status = status; // Actualizar el estado del mes correspondiente

            // Guardar los cambios en la base de datos
            await membership.save();

            return res.status(200).json({ message: 'Pago actualizado exitosamente', membership });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al actualizar el pago', error });
        }
    },
    async getMembershipByClub(req, res) {
        const { clubId } = req.params;

        try {
            // Buscar todas las membresías que correspondan al club
            const memberships = await Membership.find({ club: clubId })
                .populate('student', {name: 1, lastName: 1, email:1, imgUrl: 1, phone: 1,school_representative: 1 }) // Asegúrate de que el campo student esté poblado
                .sort({ 'student.lastName': 1 }); // Ordenar por apellido del estudiante

            if (!memberships.length) {
                return res.status(404).json({ message: 'No se encontraron membresías para este club' });
            }

            return res.status(200).json({ memberships });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al obtener las membresías', error });
        }
    },
    async getMembershipByStudent(req, res) {
        const { studentId } = req.params;

        try {
            // Buscar todas las membresías que correspondan al estudiante
            const memberships = await Membership.find({ student: studentId })
                .populate('club', {name:1}) // Población de club e institución si es necesario
                .sort({ year: 1 }); // Ordenar por año, puedes cambiar esto según tus necesidades

            if (!memberships.length) {
                return res.status(404).json({ message: 'No se encontraron membresías para este estudiante' });
            }

            return res.status(200).json({ memberships });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al obtener las membresías', error });
        }
    },
    async deleteMembership(req, res) {
        const { membershipId } = req.params;

        try {
            // Buscar la membresía por ID
            const membership = await Membership.findById(membershipId);
            if (!membership) {
                return res.status(404).json({ message: 'Membresía no encontrada' });
            }

            // Eliminar la membresía
            await Membership.findByIdAndDelete(membershipId);

            return res.status(200).json({ message: 'Membresía eliminada exitosamente' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al eliminar la membresía', error });
        }
    },
    async createMembershipByPlayer(req, res) {
        const { studentId, clubId } = req.params;

        try {
            // Verificar si el club existe
            const club = await Club.findById(clubId);
            if (!club) {
                return res.status(404).json({ message: 'Club no encontrado' });
            }

            // Crear una nueva membresía
            const newMembership = new Membership({
                student: studentId,
                club: clubId,
                statusMembership:"activo",
                amount:0,
                institution: club.institution, // Asignar la institución del club
                year: new Date().getFullYear(), // Asignar el año actual
                january: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
                february: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
                march: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
                april: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
                may: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
                june: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
                july: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
                august: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
                september: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
                october: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
                november: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
                december: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
            });

            // Guardar la nueva membresía en la base de datos
            await newMembership.save();

            return res.status(201).json({ message: 'Membresía creada exitosamente', membership: newMembership });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al crear la membresía', error });
        }
    },
    async updateMemebership(req, res) {
        try {
            const { membershipId } = req.params;
            const updatedMembership = req.body;

            // Buscar la membresía por ID
            const membership = await Membership.findByIdAndUpdate(membershipId, updatedMembership, { new: true });

            if (!membership) {
                return res.status(404).json({ message: 'Membresía no encontrada' });
            }

            return res.status(200).json({ message: 'Membresía actualizada exitosamente', membership });
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al actualizar la membresía', error });
            
        }
    },
    async createMembership(req, res) {
        const { year, institutionId, amount } = req.params;
    
        try {
            // Buscar la institución por su ID y poblar los clubes y sus estudiantes
            const institution = await Institution.findById(institutionId).populate({
                path: 'clubs',
                populate: {
                    path: 'students',
                    model: 'student'
                }
            });
    
            if (!institution) {
                return res.status(404).json({ message: 'Institución no encontrada' });
            }
    
            // Crear membresías para cada estudiante en cada club
            const memberships = [];
    
            for (const club of institution.clubs) {
                // Verificar si club.students es un array
                if (Array.isArray(club.students)) {
                    for (const student of club.students) {
                        // Comprobar si ya existe una membresía activa para el año actual
                        const existingMembership = await Membership.findOne({
                            student: student._id,
                            year: year,
                            club: club._id,
                            institution: institution._id,
                            statusMembership: "activo"
                        });
    
                        if (!existingMembership) {
                            const membership = new Membership({
                                student: student._id,
                                year: year,
                                club: club._id,
                                institution: institution._id,
                                amount: amount,
                                statusMembership: "activo",
                                january: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                                february: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                                march: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                                april: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                                may: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                                june: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                                july: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                                august: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                                september: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                                october: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                                november: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                                december: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null }
                            });
    
                            memberships.push(membership.save());
                        } else {
                            console.log(`Membresía ya existe para el estudiante ${student._id} en el club ${club._id} para el año ${year}`);
                        }
                    }
                } else {
                    console.warn(`Club ${club.name} no tiene estudiantes o no es un array.`);
                }
            }
    
            // Esperar a que todas las membresías se guarden
            const savedMemberships = await Promise.all(memberships);
    
            return res.status(201).json({ message: 'Membresías creadas exitosamente', memberships: savedMemberships });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al crear las membresías', error });
        }
    },
    async updateMembershipAmount(req, res) {
        const { clubId, amount } = req.params;
    
        try {
            // Validar que los parámetros sean válidos
            if (!clubId || !amount) {
                return res.status(400).json({ message: 'El clubId y el amount son obligatorios' });
            }
    
            // Buscar las membresías de los estudiantes del club
            const memberships = await Membership.find({
                club: clubId
            });
    
            if (!memberships || memberships.length === 0) {
                return res.status(404).json({ message: 'No se encontraron membresías para el club especificado' });
            }
    
            // Actualizar el campo amount de cada membresía
            const updatedMemberships = await Promise.all(
                memberships.map(async (membership) => {
                    membership.amount = amount;
                    return membership.save();
                })
            );
    
            return res.status(200).json({ 
                message: 'El campo amount se actualizó correctamente en todas las membresías del club',
                updatedMemberships
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al actualizar el campo amount', error });
        }
    },
    async getMembershipsPlayersClub(req, res) {
        const { clubId, year } = req.params;
    
        try {
            // Validar que los parámetros sean válidos
            if (!clubId || !year) {
                return res.status(400).json({ message: 'El clubId y el year son obligatorios' });
            }
    
            // Buscar el club y poblar sus estudiantes
            const club = await Club.findById(clubId).populate('students');
    
            if (!club) {
                return res.status(404).json({ message: 'Club no encontrado' });
            }
    
            // Obtener los IDs de los estudiantes del club
            const studentIds = club.students.map(student => student._id);
    
            // Buscar las membresías que coincidan con el club, el año y los estudiantes
            const memberships = await Membership.find({
                club: clubId,
                year: year,
                student: { $in: studentIds }
            });
    
            // Verificar si todos los estudiantes tienen membresía
            const totalStudents = studentIds.length;
            const totalMemberships = memberships.length;
            const allStudentsHaveMemberships = totalStudents === totalMemberships;
    
            if (!memberships || memberships.length === 0) {
                return res.status(404).json({ message: 'No se encontraron membresías para los estudiantes del club en el año especificado' });
            }
    
            return res.status(200).json({ 
                message: 'Membresías encontradas',
                memberships,
                allStudentsHaveMemberships,
                missingStudents: totalStudents - totalMemberships
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al buscar las membresías', error });
        }
    }
    
}

module.exports = membershipController;  //exportando el controlador para que se pueda usar en otros