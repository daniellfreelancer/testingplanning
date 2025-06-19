const AccessControl = require('./accessModel')


const queryPopulate = [
{
    path: 'institution user student userGym userAuth userGymAuth',
    select: 'name lastName email role rut phone imgUrl'
}
]

const AccessControlController = {

    createRegisterAccessControl : async (req, res) => {
        try {
            const access = await AccessControl.create(req.body)
            res.status(200).json(access)
        } catch (error) {
            res.status(500).json(error)
        }
    },
    getAllRegisterAccessControl : async (req, res) =>{
        try {
            const access = await AccessControl.find().sort({createdAt: -1}).populate(queryPopulate)
            res.status(200).json(access)
        } catch (error) {
            res.status(500).json(error)
        }
    },
    getRegisterAccessControlByInstitution : async (req, res) =>{
        try {
            const {institutionId} = req.params
            const access = await AccessControl.find({institution: institutionId}).sort({createdAt: -1}).populate(queryPopulate)
            res.status(200).json(access)
        } catch (error) {
            res.status(500).json(error)
        }
    }

}

module.exports = AccessControlController
