require("dotenv").config();
const { WebpayPlus, Options, Environment, TransactionDetail } = require("transbank-sdk");
const commerceCode = process.env.TBK_WEBPAY_MALL_COMMERCE_CODE;
const APIKey = process.env.TBK_API_KEY;
const environment = (process.env.TBK_ENVIRONMENT || "").toUpperCase() === "PRODUCTION"
    ? Environment.Production
    : Environment.Integration;

const options = new Options(commerceCode, APIKey, environment);
const transaction = new WebpayPlus.MallTransaction(options);

const webpayMallController = {
    initTransaction: async (req, res) => {
        try {
            const { buyOrder, sessionId, returnUrl, amount, tienda } = req.body;

            if (!buyOrder || !sessionId || !returnUrl || !amount || !tienda) {
                return res.status(400).json({ error: "Faltan campos obligatorios" });
            }

            const envVarName = `TBK_WEBPAY_MALL_COMMERCE_CODE_${tienda}`;
            const childCommerceCode = process.env[envVarName];
            //console.log(`tienda: ${tienda}`);
            //console.log(`envVarName: ${envVarName}`);
            //console.log(`childCommerceCode: ${childCommerceCode}`);

            if (!childCommerceCode) {
                return res.status(400).json({ error: `Código de comercio no configurado para tienda ${tienda}` });
            }

            const details = [
                new TransactionDetail(amount, childCommerceCode, buyOrder)
            ];


            const response = await transaction.create(
                buyOrder,
                sessionId,
                returnUrl,
                details
            );

            res.status(200).json({
                token: response.token,
                url: response.url
            });
        } catch (error) {
            console.error("Init Mall transaction error:", error.response?.data || error.message);
            res.status(500).json({ error: "Error al iniciar transacción mall" });
        }
    },

    commitTransaction: async (req, res) => {
        try {
            const { token_ws } = req.body;

            if (!token_ws) {
                return res.status(400).json({ error: "Falta el parámetro token_ws" });
            }

            const response = await transaction.commit(token_ws);

            const allAuthorized = response.details.every(
                (d) => d.response_code === 0 && d.status === "AUTHORIZED"
            );

            if (!allAuthorized) {
                return res.status(400).json({
                    error: "Una o más sub-transacciones fueron rechazadas",
                    details: response.details
                });
            }

            res.status(200).json(response);
        } catch (error) {
            console.error("Commit error:", error.response?.data || error.message);
            res.status(500).json({ error: "Error al confirmar la transacción mall" });
        }
    },

    getStatus: async (req, res) => {
        try {
            const { token } = req.params;

            const response = await transaction.status(token);
            res.status(200).json(response);
        } catch (error) {
            console.error("Status error:", error.response?.data || error.message);
            res.status(500).json({ error: "Error al obtener estado mall" });
        }
    },

    refundTransaction: async (req, res) => {
        try {
            const { token, buyOrder, commerceCode, amount } = req.body;

            const response = await transaction.refund(token, buyOrder, commerceCode, amount);
            res.status(200).json(response);
        } catch (error) {
            console.error("Refund error:", error.response?.data || error.message);
            res.status(500).json({ error: "Error al reembolsar mall" });
        }
    }
};

module.exports = webpayMallController;
