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
  // opcional (recomendado): define la URL de login de profesionales en tu .env
} = process.env;

// 👇 URL fallback si no está en .env
const DEFAULT_PROFESIONAL_LOGIN_URL = "https://ucad.vitalmoveglobal.com/login";

const sendWelcomeProfesionalMail = async (email, password, name, rol) => {
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

    const toEmail = String(email).trim().toLowerCase();
    const safeName = name ? String(name).trim() : "¡Hola!";
    const safeRol = rol ? String(rol).trim() : "profesional";

    const loginUrl = DEFAULT_PROFESIONAL_LOGIN_URL;

    const mailOptions = {
      from: GOOGLE_USER,
      to: toEmail,
      subject: "¡Bienvenido/a! Acceso Profesional - UCAD",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Bienvenido/a Profesional</title>
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
            .header-logos {
              display: flex;
              flex-wrap: nowrap;
              align-items: center;
              justify-content: center;
              gap: 24px;
            }
            .header-logos img {
              height: 96px;
              width: auto;
              max-width: 280px;
              object-fit: contain;
            }

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
                  <div class="header-logos">
                    <a href="https://vitalmoveglobal.com" target="_blank" style="display: flex; align-items: center;">
                      <img class="Vitalmove" src="https://gestion.vitalmove.cl/static/media/logoVMDark.bfb629aa47764b494994.png" alt="VitalMove Logo">
                    </a>
                    <img class="Vitalmove" src="https://ucad.vitalmoveglobal.com/logos/carLogo.png" alt="UCAD Logo">
                  </div>
                </td>
              </tr>

              <tr>
                <td class="body-content">
                  <p class="welcome-title">¡Bienvenido/a!</p>

                  <p class="greeting-text">
                    Hola <span style="font-weight: 600;">${safeName}</span>,
                  </p>

                  <p class="greeting-text">
                    Tu cuenta profesional fue creada exitosamente. Aquí están tus credenciales de acceso:
                  </p>

                  <p class="password-info">
                    <strong>Usuario:</strong> ${toEmail}<br/>
                    <strong>Contraseña:</strong> <span class="highlight-password">${password}</span><br/>
                    <strong>Rol:</strong> ${safeRol}
                  </p>

                  <p class="password-info">
                    Por seguridad, te recomendamos guardar tu contraseña y no compartirla con terceros.
                  </p>

                  <div class="button-wrapper">
                    <a href="${loginUrl}" class="button" target="_blank">
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
                   Powered by <a href="https://vitalmoveglobal.com" class="footer-link" target="_blank">www.vitalmoveglobal.com</a>
                  </p>
                </td>
              </tr>
            </table>

          </center>
        </body>
        </html>
      `,
    };

    await smtpTransport.sendMail(mailOptions);
    console.log("Email de bienvenida (profesional) enviado con éxito: Receive ok");
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendWelcomeProfesionalMail;
