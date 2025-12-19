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

const sendWelcomeDeportistaMail = async (email, password, name) => {
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

    // normaliza por si llega raro
    const toEmail = String(email).trim().toLowerCase();
    const safeName = name ? String(name).trim() : "¡Hola!";

    const mailOptions = {
      from: GOOGLE_USER,
      to: toEmail,
      subject: "¡Bienvenido/a al sistema de gestion de citas UCAD - CAR!",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Bienvenido/a</title>
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

            .footer { padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; }
            .footer-link { color: #888888; text-decoration: underline; }

            @media only screen and (max-width: 620px) {
              .content-table { width: 100% !important; border-radius: 0; box-shadow: none; }
              .body-content { padding: 20px 25px 30px 25px !important; }
              .welcome-title { font-size: 24px !important; }
            }
          </style>
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
                  <p class="welcome-title">¡Bienvenido/a al sistema de gestion de citas UCAD - CAR!</p>

                  <p class="greeting-text">
                    Hola <span style="font-weight: 600;">${safeName}</span>,
                  </p>

                  <p class="greeting-text">
                    Tu cuenta fue creada exitosamente. A continuación te dejamos tus credenciales de acceso:
                  </p>

                  <p class="password-info">
                    <strong>Usuario:</strong> ${toEmail}<br/>
                    <strong>Contraseña:</strong>
                    <span class="highlight-password">${password}</span>
                  </p>

                  <p class="password-info">
                    Por seguridad, te recomendamos guardar tu contraseña y no compartirla con terceros.
                  </p>

                  <div class="button-wrapper">
                    <a href="" class="button" target="_blank">
                      INICIAR SESIÓN
                    </a>
                  </div>
                </td>
              </tr>
            </table>

            <table class="footer" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px;">
              <tr>
                <td>
                  <p style="margin: 0; padding: 20px;">
                    Visítanos en <a href="https://vitalmoveglobal.com" class="footer-link" target="_blank">www.vitalmoveglobal.com</a>
                  </p>
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
    console.log("Email de bienvenida (deportista) enviado con éxito: Receive ok");
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendWelcomeDeportistaMail;
