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


const sendWelcomeMailPteAlto = async (email, password, name) => {
    try {
        const oauth2Client = new OAuth2(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_URL);

        oauth2Client.setCredentials({
            refresh_token: GOOGLE_REFRESH,
        });

        const accessToken = await oauth2Client.getAccessToken();

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
            subject: "Bienvenido a Deportes Puente Alto",
            html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <title>Bienvenido a VitalMove</title>
              <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" type="text/css">
              <style>
                /* Reset styles */
                body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Montserrat', sans-serif; -webkit-font-smoothing: antialiased; }
                table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                td { padding: 0; }
                a { text-decoration: none; color: #00d09c; }
                img { border: 0; display: block; max-width: 100%; }
    
                /* Main container */
                .email-wrapper { width: 100%; background-color: #f4f7f6; }
                .content-table { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    
                /* Header */
                .header { padding: 30px 20px; text-align: center; }
                .logo-img { width: 120px; height: auto; }
    
                /* Body */
                .body-content { padding: 20px 40px 40px 40px; text-align: center; color: #333333; }
                .welcome-title { font-size: 28px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; line-height: 1.2; }
                .greeting-text { font-size: 16px; line-height: 1.6; margin-bottom: 15px; }
                .password-info { font-size: 16px; line-height: 1.6; margin-bottom: 25px; color: #555555; }
                .highlight-password { font-weight: 700; color: #000000; }
    
                /* Button */
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
                    mso-padding-alt: 10px 25px; /* Outlook padding */
                }
                .button:hover { background-color: #00b080; }
    
                /* App Download Section */
                .app-download-section { background-color: #e4faf4; padding: 40px 20px; text-align: center; border-radius: 0 0 8px 8px; }
                .app-download-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 25px; }
                .app-badges-wrapper { display: flex; justify-content: center; align-items: center; gap: 20px; flex-wrap: wrap; }
                .app-badge-link { display: inline-block; }
                .app-badge-img { width: 130px; height: auto; } /* Adjusted size for better balance */
    
                /* Footer */
                .footer { padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; }
                .footer-link { color: #888888; text-decoration: underline; }
    
                /* Mobile adjustments */
                @media only screen and (max-width: 620px) {
                  .content-table { width: 100% !important; border-radius: 0; box-shadow: none; }
                  .body-content, .app-download-section { padding: 20px 25px 30px 25px !important; }
                  .welcome-title { font-size: 24px !important; }
                  .app-badges-wrapper { flex-direction: column; gap: 15px; }
                  .app-badge-img { width: 110px !important; }
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
                <!-- [if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="email-wrapper" role="presentation" style="width:100%;background-color:#f4f7f6;" width="100%"><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="content-table" role="presentation" style="width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);" width="600"><tr><td style="padding:0;border-radius:8px;overflow:hidden;"><![endif]-->
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
                      <p class="welcome-title">¡Bienvenido/a a VitalMove!</p>
                      <p class="greeting-text">Hola <span style="font-weight: 600;">${name}</span>,</p>
                      <p class="greeting-text">Nos alegra tenerte a bordo.</p>
                      <p class="password-info">Tu contraseña actual es: <strong class="highlight-password">${password}</strong></p>
                      <p class="password-info">Te recomendamos cambiarla una vez que inicies sesión por primera vez desde tu perfil.</p>
    
                      <div class="button-wrapper">
                        <!--[if mso]>
                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://ptealto.vitalmoveglobal.com/login" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="#00d09c" fillcolor="#00d09c">
                          <w:anchorlock/>
                          <center style="color:#ffffff;font-family:Montserrat,sans-serif;font-size:16px;font-weight:600;">INICIAR SESIÓN</center>
                        </v:roundrect>
                        <![endif]-->
                        <!--[if !mso]><!-->
                        <a href="https://ptealto.vitalmoveglobal.com/login" class="button" target="_blank">
                          INICIAR SESIÓN
                        </a>
                        <!--<![endif]-->
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="app-download-section">
                      <p class="app-download-title">Descarga la app de VitalMove en tu dispositivo:</p>
                      <div class="app-badges-wrapper">
                        <a href="https://apps.apple.com/app/vitalmove" class="app-badge-link" target="_blank">
                          <img class="app-badge-img" src="https://upload.wikimedia.org/wikipedia/commons/5/5d/Available_on_the_App_Store_%28black%29.png" alt="Descargar en App Store">
                        </a>
                        <a href="https://play.google.com/store/apps/details?id=vitalmove" class="app-badge-link" target="_blank">
                          <img class="app-badge-img" src="https://upload.wikimedia.org/wikipedia/commons/e/ee/Google_Play_logo.png" alt="Descargar en Google Play">
                        </a>
                      </div>
                    </td>
                  </tr>
                </table>
                <!-- [if mso | IE]></td></tr></table></td></tr></table><![endif]-->
    
                <!-- Footer Outside Main Card -->
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
        console.log("Email de bienvenida a sido enviado con exito: Receive ok");
    } catch (error) {
        console.log(error);
    }
}

module.exports = sendWelcomeMailPteAlto;