require("dotenv").config();
const { WebpayPlus, Options, Environment } = require("transbank-sdk");

const commerceCode = process.env.TBK_COMMERCE_CODE;
const apiKey = process.env.TBK_API_KEY;
const environment = process.env.TBK_ENVIRONMENT === "Integration"
    ? Environment.Production
    : Environment.Integration;

const options = new Options(commerceCode, apiKey, environment);
const transaction = new WebpayPlus.Transaction(options);

const transbankController = {
    initTransaction: async (req, res) => {
        try {
            const { amount, sessionId, buyOrder, returnUrl } = req.body;

            const createResponse = await transaction.create(
                buyOrder,
                sessionId,
                amount,
                returnUrl
            );

            res.status(200).json({
                url: createResponse.url,
                token: createResponse.token
            });
        } catch (error) {
            console.error("Init transaction error:", error.response?.data || error.message);
            res.status(500).json({ error: "Error al iniciar la transacción" });
        }
    },

    commitTransaction: async (req, res) => {
        try {
            const { token_ws } = req.body;
            const response = await transaction.commit(token_ws);
            res.status(200).json(response);
        } catch (error) {
            console.error("Commit error:", error.response?.data || error.message);
            res.status(500).json({ error: "Error al confirmar la transacción" });
        }
    },

    getStatus: async (req, res) => {
        try {
            const { token } = req.params;
            const response = await transaction.status(token);
            res.status(200).json(response);
        } catch (error) {
            console.error("Status error:", error.response?.data || error.message);
            res.status(500).json({ error: "Error al obtener el estado" });
        }
    },

    refundTransaction: async (req, res) => {
        try {
            const { token, amount } = req.body;
            const response = await transaction.refund(token, amount);
            res.status(200).json(response);
        } catch (error) {
            console.error("Refund error:", error.response?.data || error.message);
            res.status(500).json({ error: "Error al reembolsar" });
        }
    }
};

module.exports = transbankController;
