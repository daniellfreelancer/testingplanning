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

const sendRenewPasswordMailPteAlto = async (email, password, name) => {
  try {
    const oauth2Client = new OAuth2(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_URL);

    oauth2Client.setCredentials({
      refresh_token: GOOGLE_REFRESH,
    });

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
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: GOOGLE_USER,
      to: email,
      subject: "Recuperación de contraseña - VitalMove",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Recuperación de contraseña</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" type="text/css">
          <style>
            body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Montserrat', sans-serif; -webkit-font-smoothing: antialiased; }
            table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            td { padding: 0; }
            a { text-decoration: none; color: #00d09c; }
            img { border: 0; display: block; max-width: 100%; }

            .email-wrapper { width: 100%; background-color: #f4f7f6; }
            .content-table { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

            .header { padding: 30px 20px; text-align: center; }

            .body-content { padding: 20px 40px 40px 40px; text-align: center; color: #333333; }
            .welcome-title { font-size: 28px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; line-height: 1.2; }
            .greeting-text { font-size: 16px; line-height: 1.6; margin-bottom: 15px; }
            .password-info { font-size: 16px; line-height: 1.6; margin-bottom: 25px; color: #555555; }
            .highlight-password { font-weight: 700; color: #000000; }

            .button-wrapper { text-align: center; margin-bottom: 30px; }
            .button {
              display: inline-block;
              padding: 14px 30px;
              background-color: #00d09c;
              color: #ffffff !important;
              font-size: 16px;
              font-weight: 600;
              border-radius: 5px;
              text-decoration: none;
              transition: background-color 0.2s ease;
              -webkit-transition: background-color 0.2s ease;
              mso-padding-alt: 10px 25px;
            }
            .button:hover { background-color: #00b080; }

            .app-download-section { background-color: #e4faf4; padding: 40px 20px; text-align: center; border-radius: 0 0 8px 8px; }
            .app-download-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 25px; }
            .app-badges-wrapper { display: flex; justify-content: center; align-items: center; gap: 20px; flex-wrap: nowrap; width: 100%; }
            .app-badge-link { display: inline-block; width: 40%; text-align: center; }
            .app-badge-img { width: 100%; max-width: 100%; height: auto; }

            .footer { padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; }
            .footer-link { color: #888888; text-decoration: underline; }

            @media only screen and (max-width: 620px) {
              .content-table { width: 100% !important; border-radius: 0; box-shadow: none; }
              .body-content, .app-download-section { padding: 20px 25px 30px 25px !important; }
              .welcome-title { font-size: 24px !important; }
              .app-badges-wrapper { flex-direction: row; gap: 15px; }
              .app-badge-link { width: 40% !important; }
              .app-badge-img { width: 100% !important; max-width: 100% !important; }
            }
          </style>
          <!--[if mso]>
          <style type="text/css">
            .button { padding: 10px 25px; display: inline-block; }
            .button a { background-color: #00d09c; padding: 10px 25px; border-radius: 5px; color: #ffffff !important; }
            .button table { display: inline-block !important; }
          </style>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Montserrat', sans-serif;">
          <center class="email-wrapper">
            <table class="content-table" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td class="header">
                  <a href="https://vitalmoveglobal.com" target="_blank">
                    <img class="Vitalmove" src="https://gestion.vitalmove.cl/static/media/logoVMDark.bfb629aa47764b494994.png" alt="VitalMove Logo">
                  </a>
                </td>
              </tr>
              <tr>
                <td class="body-content">
                  <p class="welcome-title">Recuperación de contraseña</p>
                  <p class="greeting-text">Hola <span style="font-weight: 600;">${name}</span>,</p>
                  <p class="greeting-text">Recibimos una solicitud para renovar tu contraseña.</p>

                  <p class="password-info">
                    Tu nueva contraseña es:
                    <strong class="highlight-password">${password}</strong>
                  </p>

                  <p class="password-info">
                    Por seguridad, te recomendamos no compartir esta contraseña.
                    Si tú no solicitaste este cambio, por favor contáctanos.
                  </p>

                  
                </td>
              </tr>
             
              <tr>
                <td class="app-download-section">
                  <p class="app-download-title">Descarga la app de VM UCAD en tu dispositivo:</p>
                  <div class="app-badges-wrapper">
                    <a href="https://apps.apple.com" class="app-badge-link" target="_blank">
                      <img class="app-badge-img" src="https://upload.wikimedia.org/wikipedia/commons/5/5d/Available_on_the_App_Store_%28black%29.png" alt="Descargar en App Store">
                    </a>
                 <a href="https://play.google.com/store/apps/details?id=com.vitalmovecar&pcampaignid=web_share" class="app-badge-link" target="_blank">
                      <img class="app-badge-img" src="https://upload.wikimedia.org/wikipedia/commons/e/ee/Google_Play_logo.png" alt="Descargar en Google Play">
                    </a>
                  </div>
                </td>
              </tr>
              
            </table>

            <table class="footer" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px;">
              <tr>
                <td>
                  <p style="margin: 0; padding: 20px;">Visítanos en <a href="https://vitalmoveglobal.com" class="footer-link" target="_blank">www.vitalmoveglobal.com</a></p>
                  <p style="margin: 0;">© 2025 VitalMove. Todos los derechos reservados.</p>
                </td>
              </tr>
            </table>

          </center>
        </body>
        </html>
      `,
    };

    await smtpTransport.sendMail(mailOptions);
    console.log("Email de recuperación de contraseña enviado con éxito: Receive ok");
  } catch (error) {
    console.error("Error al enviar email de recuperación de contraseña:", error);
    // Lanzar el error para que el controlador lo maneje
    throw new Error(`Error al enviar correo de recuperación: ${error.message}`);
  }
};

module.exports = sendRenewPasswordMailPteAlto;
