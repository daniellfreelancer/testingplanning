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
    },
    getLastTimeHub: async (req, res) => {
        const { hubId, currentTime } = req.params;

        try {
            // Convertir el currentTime a un objeto Date
            const currentDateTime = new Date(currentTime);

            // Calcular la marca de tiempo 30 segundos antes de currentTime
            const thirtySecondsAgo = new Date(currentDateTime.getTime() - 30 * 1000);

            // Obtener los últimos 20 registros para el hubId dado
            const vmDevices = await VmDeviceModel.find({ hubId })
                .sort({ timestamp: -1 })
                .limit(20);

            // Verificar si alguno de los registros está dentro de los últimos 30 segundos
            const isHubConnected = vmDevices.some(device => {
                const deviceTime = new Date(device.timestamp);
                return deviceTime >= thirtySecondsAgo && deviceTime <= currentDateTime;
            });

            res.status(200).json({
                hubId,
                isConnected: isHubConnected,
                message: isHubConnected 
                    ? `El hub con id ${hubId} está conectado.` 
                    : `El hub con id ${hubId} no ha enviado datos en los últimos 30 segundos.`,
                success: true
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al verificar la conexión del hub' });
        }
    },
    getLastRegister: async (req, res) => {

        const { hubId } = req.params;
    
        try {
            const vmDevices = await VmDeviceModel.find({ hubId })
            .sort({ timestamp: -1 })
            .limit(20);

            if (!vmDevices) {
                return res.status(404).json({ message: 'No se ha encontrado un registro para el hubId' });
            }

            res.status(200).json({
                response: vmDevices,
                message: `ultimos 20  registro obtenido para el hubId ${hubId}`,
                success: true,
            });
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el último registro' });
            
        }

    }

}


module.exports = devicesCLController
