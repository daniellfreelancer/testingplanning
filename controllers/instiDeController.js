const INSTI = require('../models/institution')
const INSTIDECENTRALIZED = require('../models/institutionDecentralized')
const Schools = require('../models/school')
const Teachers = require('../models/admin')
const Programs = require('../models/program')
const Students = require('../models/student')
const Classrooms = require('../models/classroom')
const Workshops = require('../models/workshop')



const queryPopulateInstitutions = [
    {
        path: 'institution',
        select: 'name address phone email rut logo type admins director adminsOffice hubId subscriptions',
        populate: [
            { 
                path: 'admins', 
                select: 'name lastName email role rut logged phone imgUrl' 
            },
            { path: 'programs', 
              populate: [
                { path: 'students', select: 'name lastName email role rut logged phone age weight size gender imgUrl classroom school grade' },
                { path: 'workshops', select: 'name address email days ageRange hours' }
              ]
             },
            { path: 'schools',
                select: 'name address phone email rut logo type admins director adminsOffice hubId subscriptions',
                populate: [
                    { 
                        path: 'admins', 
                        select: 'name lastName email role rut logged phone imgUrl' 
                    },
                    { path: 'classrooms', 
                      populate: [
                        { path: 'students', select: 'name lastName email role rut logged phone age weight size gender imgUrl classroom school grade' },
                        { path: 'workshops', select: 'name address email days ageRange hours' }
                      ]
                    }
                ]
             },
        ]
    }
]

const institucionDecentralized = {

    addInstitucionDecentralizada : async (req, res) => {
        const {admins} = req.body
        try {
            let newInstiDecentralized = await new INSTIDECENTRALIZED(req.body).save()
            if (newInstiDecentralized) {

                let idnewInsti = newInstiDecentralized._id
                let idAdmin = admins
                let admin = await Teachers.findById(idAdmin)
                admin.institution = idnewInsti
                admin.save()

                res.status(200).json({
                    message: "Institución decentralizada registrada con éxito",
                    data: newInstiDecentralized,
                    success: true
                })
            }
        } catch (error) {
            res.status(400).json({
                message: 'Error al crear institución decentralizada',
                success: false,
                error: error.message
            });
        }
    },
    getInstitucionesDecentralizadas : async (req, res) => {
        try {
            let institucionesDecentralizadas = await INSTIDECENTRALIZED.find().populate('institution', {name: 1})
            if (institucionesDecentralizadas) {
                res.status(200).json({
                    message: "Instituciones decentralizadas obtenidas con éxito",
                    data: institucionesDecentralizadas,
                    success: true
                })
            }
        } catch (error) {
            res.status(400).json({
                message: 'Error al obtener instituciones decentralizadas',
                success: false,
                error: error.message
            });
        }
    },
    getInstitucionDecentralizadaporID : async (req, res) => {
        const {id} = req.params
        try {
            let institucionDecentralizada = await INSTIDECENTRALIZED.findById(id).populate(queryPopulateInstitutions)
            if (institucionDecentralizada) {
                res.status(200).json({
                    message: "Institución decentralizada obtenida con éxito",
                    data: institucionDecentralizada,
                    success: true
                })
            }
        } catch (error) {
            res.status(400).json({
                message: 'Error al obtener institución decentralizada',
                success: false,
                error: error.message
            });
        }
    },
    deleteInstitutionDecentralizada: async (req,res) => {
        const {id} = req.params
        try {
            let institucionDecentralizada = await INSTIDECENTRALIZED.findByIdAndDelete(id)
            if (institucionDecentralizada) {
                res.status(200).json({
                    message: "Institución decentralizada eliminada con éxito",
                    data: institucionDecentralizada,
                    success: true
                })
            }
        } catch (error) {
            res.status(400).json({
                message: 'Error al eliminar institución decentralizada',
                success: false,
                error: error.message
            });
        }

    },
    updateInstitutionDecentralizada : async (req, res) =>{
        const {id} = req.params
        const update = req.body
        try {
            let institucionDecentralizada = await INSTIDECENTRALIZED.findByIdAndUpdate(id, update, {new: true}).populate(queryPopulateInstitutions)
            if (institucionDecentralizada) {
                res.status(200).json({
                    message: "Institución decentralizada actualizada con éxito",
                    data: institucionDecentralizada,
                    success: true
                })
            }
        } catch (error) {
            res.status(400).json({
                message: 'Error al actualizar institución decentralizada',
                success: false,
                error: error.message
            });
        }
    }

}

module.exports = institucionDecentralized