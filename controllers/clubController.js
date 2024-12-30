const Clubs = require('../models/club')
const Institution = require('../models/institution')
const Trainers = require('../models/admin')
const Players = require('../models/student')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');

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

const clubQueryPopulate = [
    {
        path : 'categories teachers students institution',
        select : 'name lastName email gender age size gender'
    }

]

const ClubController = {
    createClub : async (req, res) => {

        const {institutionId} = req.params

        try {

            let club = new Clubs(req.body)

            if (club) {

                const institution = await Institution.findById(institutionId)
             
                if (!institution) {
                    return res.status(404).json({
                      message: 'Institución no encontrada',
                      success: false
                    });
                  }
                institution.clubs.push(club._id)

                await institution.save()

                club.institution = institutionId
                await club.save()


                res.status(201).json({
                    message: "Club creado con éxito",
                    response: club,
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "Error al crear club",
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
    },
    getClubs : async (req, res) => {
        try {

            let clubs = await Clubs.find()

            if (clubs) {
                res.status(200).json({
                    message: "Clubs obtenidos con éxito",
                    response: clubs,
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "No se encontraron clubs",
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
    },
    getClubById : async (req, res) => {
        try {

            let club = await Clubs.findById(req.params.id).populate(clubQueryPopulate)

            if (club) {
                res.status(200).json({
                    message: "Club obtenido con éxito",
                    response: club,
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "No se encontró el club",
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
    },
    updateClubLogo: async (req, res) => {
        try {
            // Actualizar solo los campos de texto
            let club = await Clubs.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
            // Verificar si se ha recibido un archivo
            if (req.file) {
                const fileContent = req.file.buffer;
                const extension = req.file.originalname.split('.').pop();
                const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;
    
                const params = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: fileContent,
                    ContentType: req.file.mimetype,
                };
    
                await clientAWS.send(new PutObjectCommand(params));
                club.logo = fileName; // Actualizar el logo en el objeto club
                await club.save(); // Guardar los cambios en el club
            }
    
            // Enviar la respuesta exitosa después de la actualización
            res.status(200).json({
                message: "Club actualizado con éxito",
                response: club,
                success: true
            });
    
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: error.message,
                success: false
            });
        }
    },
    deleteClub : async (req, res) => {

        let {institutionId, clubId} = req.params
        try {

            const institution = await Institution.findById(institutionId)
            if (institution) {
                let index = institution.clubs.indexOf(clubId)
                if (index > -1) {
                    institution.clubs.splice(index, 1);
                    await institution.save();
                } else {
                    res.status(404).json({
                        message: "Club no encontrado en la institución",
                        success: false
                    })
                }
            }
             
            let club = await Clubs.findByIdAndDelete(clubId)
            if (club) {
                res.status(200).json({
                    message: "Club eliminado con éxito",
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "No se encontró el club",
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
    },
    getClubByInstitution: async (req, res) => {

        try {

            let {institutionId} = req.params;

            let clubs = await Clubs.find({ institution: institutionId })
            if (clubs.length > 0) {
                res.status(200).json({
                    message: "Clubs obtenidos con éxito",
                    response: clubs,
                    success: true
                })
            } else {
                res.status(404).json({
                    message: "No se encontraron clubs",
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


    },
    addPlayer: async (req, res) => {
        try {
            const {clubId, playerId } = req.params;

            const club = await Clubs.findById(clubId)

            if (!club) {
                return res.status(404).json({
                    message: 'Club no encontrado',
                    success: false
                });
            }

            club.students.push(playerId)
            await club.save()

            const player = await Players.findById(playerId)
            if (!player) {
                return res.status(404).json({
                    message: 'Jugador no encontrado',
                    success: false
                });
            }
            player.clubs.push(clubId)
            await player.save()

            res.status(201).json({
                message: 'Jugador agregado al club con éxito',
                success: true,
                response:{
                    club: club,
                    player: player
                }
            })

            
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: 'Error al agregar jugador al club',
                error: error.message,
                success: false
            });
            
        }
    },
    // delete player from club
    removePlayer: async (req, res) => {
        try {
            const { clubId, playerId } = req.params;

            const club = await Clubs.findByIdAndUpdate(clubId, { $pull: { students: playerId } }, { new: true });

            if (!club) {
                return res.status(404).json({
                    message: 'Club no encontrado',
                    success: false
                });
            }

            const player = await Players.findByIdAndUpdate(playerId, { $pull: { clubs: clubId } }, { new: true });

            if (!player) {
                return res.status(404).json({
                    message: 'Jugador no encontrado',
                    success: false
                });
            }

            res.status(200).json({
                message: 'Jugador eliminado del club con éxito',
                success: true,
                response:{
                    club: club,
                    player: player
                }
            });
            
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: 'Error al eliminar jugador del club',
                error: error.message,
                success: false
            });
            
        }
    }

}

module.exports = ClubController;