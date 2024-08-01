const VmDeviceModel = require('../models/vmDevice');


const devicesCLController = {
    getAllVmDevices: async (req, res) => {
        try {
            const vmDevices = await VmDeviceModel.find()
            res.status(200).json({
                response: vmDevices,
                message: 'Todos los registros de vmDevice obtenidos con éxito',
                success: true,
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los registros de vmDevice' });
        }
    },
    getVmDevicesByHubId: async (req, res) => {
        const hubId = req.params.hubId;
        try {
            const vmDevices = await VmDeviceModel.find({ hubId: hubId })
            res.json(vmDevices);
            res.status(200).json({
                response: vmDevices,
                message: 'Todos los registros de vmDevice obtenidos con éxito para el hubId'+ hubId,
                success: true,  // added success property to indicate the operation was successful.
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los registros de vmDevice por hubId' });
        }
    },
    vmDevicesByResume: async (req, res) => {
        const hubId = req.params.hubId;
        const startTimeClass = req.params.startTimeClass;
        const endTimeClass = req.params.endTimeClass;

        try {
            const vmDevices = await VmDeviceModel.find({
                hubId: hubId,
                timestamp: {
                    $gte: new Date(startTimeClass),
                    $lte: new Date(endTimeClass)
                }
            });

            res.status(200).json({
                response: vmDevices,
                message: `Dispositivos obtenidos con éxito para el hubId ${hubId} y rango de fechas ${startTimeClass} - ${endTimeClass}`,
                success: true
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los registros de vmDevice por hubId y rango de fechas' });
        }
    }

}


module.exports = devicesCLController
