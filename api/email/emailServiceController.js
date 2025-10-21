const sendPatentePiscinaSantiago = require("./mailPatentes");

const emailServiceController = {

    enviarPatentePiscinaSantiago: async (req, res) => {

    const {
        emailUser, nameUser, emailAdmin, vehicleData
    } = req.body

        try {
            await sendPatentePiscinaSantiago(emailUser, nameUser, emailAdmin, vehicleData);

            res.status(200).json({
                response: "Email de patente enviado con éxito",
                success: true
            })

        } catch (error) {
            console.log("Error al intentar enviar el email:", error.message);
            res.status(500).json({
                response: "Error al intentar enviar el email",
                error: error.message
            })
        }
    }
}

module.exports = emailServiceController;