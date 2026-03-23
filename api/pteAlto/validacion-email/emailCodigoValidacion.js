/**
 * Envía email con código de 6 dígitos para validación (registro usuarios Puente Alto).
 */
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const {
  GOOGLE_USER,
  GOOGLE_ID,
  GOOGLE_SECRET,
  GOOGLE_REFRESH,
  GOOGLE_URL,
  GOOGLE_ACCESS,
} = process.env;

const sendCodigoValidacionEmail = async (email, codigo) => {
  try {
    const oauth2Client = new OAuth2(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_URL);
    oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH });
    await oauth2Client.getAccessToken();

    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GOOGLE_USER,
        type: "OAuth2",
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        refreshToken: GOOGLE_REFRESH,
        accessToken: GOOGLE_ACCESS,
      },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: GOOGLE_USER,
      to: email,
      subject: "Código de verificación - Deportes Puente Alto",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de verificación</title>
          <style>
            body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: Arial, sans-serif; }
            .container { max-width: 500px; margin: 20px auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .logo { text-align: center; margin-bottom: 20px; }
            .logo img { width: 100px; height: auto; }
            h1 { font-size: 20px; color: #1a1a1a; margin-bottom: 15px; }
            p { font-size: 15px; color: #333; line-height: 1.5; margin: 10px 0; }
            .codigo { font-size: 28px; font-weight: 700; color: #00d09c; letter-spacing: 6px; margin: 20px 0; font-family: monospace; }
            .footer { font-size: 12px; color: #888; margin-top: 25px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="https://deportespte.vitalmoveglobal.com/logos/ptealto.webp" alt="Deportes Puente Alto">
            </div>
            <h1>Código de verificación</h1>
            <p>Tu código para completar el registro en la plataforma de Deportes Puente Alto es:</p>
            <p class="codigo">${codigo}</p>
            <p>Este código expira en 5 minutos. Si no solicitaste este código, puedes ignorar este correo.</p>
            <div class="footer">Corporación de Deportes Puente Alto - VitalMove</div>
          </div>
        </body>
        </html>
      `,
    };

    await smtpTransport.sendMail(mailOptions);
    console.log("Email de código de validación enviado correctamente a:", email);
  } catch (error) {
    console.error("Error enviando email de código:", error);
    throw error;
  }
};

module.exports = sendCodigoValidacionEmail;
