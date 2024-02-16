const IotApi = require('@arduino/arduino-iot-client');
const fetch = require('node-fetch');
const Devices = require('../models/devices')


async function getToken() {
    const url = 'https://api2.arduino.cc/iot/v1/clients/token';
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.ARDUINO_CLIENT_ID,
        client_secret: process.env.ARDUINO_CLIENT_SECRET,
        audience: 'https://api2.arduino.cc/iot'
    }).toString();

    try {
        const response = await fetch(url, { method: 'POST', headers, body });
        const data = await response.json();
        return data['access_token'];
    } catch (error) {
        console.error("Failed getting an access token: " + error);
        return null; // Asegúrate de manejar este caso en tu código
    }
}


const devicesController = {

    getArduinoData: async (req, res) => {
        const accessToken = await getToken();
        if (!accessToken) {
            res.status(500).send("Failed to authenticate with Arduino IoT Cloud");
            return;
        }
        var client = IotApi.ApiClient.instance;
        var oauth2 = client.authentications['oauth2'];
        oauth2.accessToken = accessToken;
        var api = new IotApi.PropertiesV2Api(client);

        try {

            if (data) {
                res.status(200).json({
                    response: {
                        token: accessToken,
                        client: client,
                        api: api,
                        data: data

                    }
                })


            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: error,
                success: false
            })

        }


        //Detalle IOT https://api2.arduino.cc/iot/v1/things/:idThing
        //Listado Dispositivos https://api2.arduino.cc/iot/v2/devices
        //Primero obtenemos accessToken => Bearer Token

    },
    getArduinoDevices: async (req, res) => {
        const accessToken = await getToken();
        if (!accessToken) {
            res.status(500).send("Failed to authenticate with Arduino IoT Cloud");
            return;
        }

        // Definir la URL para obtener los datos del dispositivo, reemplaza ':idThing' por el ID real del dispositivo si es necesario
        const url = 'https://api2.arduino.cc/iot/v2/devices'; // O la URL específica para detalles del dispositivo

        try {
            // Realizar la petición fetch con el accessToken
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Convertir la respuesta a JSON
            const data = await response.json();

            // Si existe data, enviar en la respuesta
            res.status(200).json({
                success: true,
                data: data
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: error.toString(),
                success: false
            });
        }


    },
    createDevice: async (req, res) => {

        let { deviceId, deviceName, deviceBpa, deviceBpm, deviceSteps, deviceStatus, deviceConnected } = req.body;

        try {
            // Busca si ya existe un dispositivo con el mismo deviceId
            const existingDevice = await Devices.findOne({ deviceId });

            if (existingDevice) {
                // Si el dispositivo ya existe, envía una respuesta indicando que ya existe
                return res.status(409).json({
                    message: "El dispositivo ya existe",
                    success: false
                });
            }
            let school = []
            let program = []

            // Si el dispositivo no existe, crea uno nuevo
            const deviceData = {
                deviceId,
                deviceName,
                deviceBpa,
                deviceBpm,
                deviceSteps,
                deviceStatus,
                deviceConnected,
                school,
                program
            };
            const device = new Devices(deviceData);
            await device.save();

            // Envía una respuesta de éxito
            res.status(201).json({
                message: "Dispositivo creado con éxito",
                success: true,
                device: device
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "Error al intentar crear el dispositivo",
                success: false
            });
        }

    },
    getDevices: async (req, res) => {

        try {

            const devices = await Devices.find().sort('deviceName');

            if (devices.length > 0){
                res.status(200).json({
                    response: devices,
                    message: "Dispositivos encontrados",
                    success:true
                })
            } else {
                res.status(200).json({
                    response: [],
                    message: "No hay dispositivos en base de datos",
                    success:true
                })
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "Error al obtener la informacion de los dispositivos",
                success: false
            });
        }
    },
    addDevicesToSchool : async (req,res) => {

    },
    removeDevicesFromSchool : async (req, res)=> {

    },
    addDevicesToProgram : async (req,res) => {

    },
    removeDevicesFromProgram : async (req, res) => {

    },
    updateDevice: async (req, res) => {

    },
    deleteDevice: async (req,res) => {

        try {
            const { id } = req.params;
            const device = await Devices.findByIdAndDelete(id)

            if (device) {
                res.status(200).json({
                    message: "Dispositivo eliminado con exito",
                    success: true
                })
            } else {
                res.status(404).json({
                    message: 'No existe dispositivo para ser eliminado',
                    success: false
                  });
            }

        } catch (error) {
            console.log(error);
            res.status(400).json({
              message: 'Error al eliminar el dispositivo',
              success: false
            });
        }



    }

}

module.exports = devicesController

