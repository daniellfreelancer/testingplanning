/**
 * Email de notificación cuando un usuario es habilitado nuevamente en Puente Alto.
 * Indica que su cuenta ha sido reactivada.
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

const LOGO_PUENTE_ALTO = "https://deportespte.vitalmoveglobal.com/logos/ptealto.webp";

const sendUsuarioHabilitadoPteAlto = async (usuario) => {
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

    const nombre = usuario.nombre || "";
    const apellido = usuario.apellido || "";
    const email = usuario.email || "";

    const mailOptions = {
      from: GOOGLE_USER,
      to: email,
      subject: "Tu cuenta ha sido habilitada nuevamente - Deportes Puente Alto",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cuenta habilitada - Deportes Puente Alto</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Montserrat', sans-serif; }
            .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { padding: 30px 20px; text-align: center; }
            .header img { width: 120px; height: auto; }
            .body-content { padding: 20px 40px 40px; color: #333; }
            .welcome-title { font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; }
            .greeting { font-size: 16px; line-height: 1.6; margin-bottom: 15px; }
            .datos-box { background: #f8f9fa; border-left: 4px solid #00d09c; padding: 20px; margin: 25px 0; border-radius: 5px; }
            .datos-title { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 15px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <a href="https://www.deportespuentealto.cl/" target="_blank">
                <img src="${LOGO_PUENTE_ALTO}" alt="Deportes Puente Alto">
              </a>
            </div>
            <div class="body-content">
              <p class="welcome-title">¡Tu cuenta ha sido habilitada nuevamente!</p>
              <p class="greeting">Hola <strong>${nombre} ${apellido}</strong>,</p>
              <p class="greeting">Te informamos que tu cuenta en la plataforma de la Corporación de Deportes Puente Alto ha sido reactivada correctamente.</p>
              <div class="datos-box">
                <p class="datos-title">Ya puedes nuevamente:</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #555;">
                  <li>Agendar espacios deportivos</li>
                  <li>Inscribirte en talleres</li>
                  <li>Participar en eventos</li>
                </ul>
              </div>
              <p class="greeting">Ingresa a la plataforma para continuar reservando y disfrutando de nuestras actividades deportivas.</p>
              <p class="greeting">Si tienes dudas, contáctanos a través de nuestros canales oficiales.</p>
            </div>
            <div class="footer">
              Corporación de Deportes Puente Alto - Powered by © 2026 VitalMove
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await smtpTransport.sendMail(mailOptions);
    console.log("Email de usuario habilitado enviado correctamente a:", email);
  } catch (error) {
    console.error("Error enviando email de usuario habilitado:", error);
    throw error;
  }
};

module.exports = sendUsuarioHabilitadoPteAlto;
