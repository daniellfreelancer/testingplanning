const codigoStore = require("./codigoStore");
const sendCodigoValidacionEmail = require("./emailCodigoValidacion");

const enviarCodigo = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "El campo email es requerido",
      });
    }
    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim) {
      return res.status(400).json({
        message: "El campo email es requerido",
      });
    }
    const check = codigoStore.puedeEnviar(emailTrim);
    if (!check.puede) {
      return res.status(429).json({
        message: `Debes esperar ${check.segundosRestantes} segundos para solicitar un nuevo código`,
        segundosRestantes: check.segundosRestantes,
      });
    }
    const codigo = codigoStore.generarYGuardar(emailTrim);
    await sendCodigoValidacionEmail(emailTrim, codigo);
    return res.status(200).json({
      message: "Código enviado correctamente",
      success: true,
    });
  } catch (error) {
    console.error("Error en enviarCodigo:", error);
    return res.status(500).json({
      message: "Error al enviar el código",
      error: error.message,
    });
  }
};

const verificarCodigo = async (req, res) => {
  try {
    const { email, codigo } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "El campo email es requerido",
      });
    }
    if (!codigo || typeof codigo !== "string") {
      return res.status(400).json({
        message: "El campo codigo es requerido",
      });
    }
    const valid = codigoStore.verificar(email.trim().toLowerCase(), codigo);
    return res.status(200).json({
      valid,
      success: true,
    });
  } catch (error) {
    console.error("Error en verificarCodigo:", error);
    return res.status(500).json({
      message: "Error al verificar el código",
      error: error.message,
    });
  }
};

module.exports = {
  enviarCodigo,
  verificarCodigo,
};
