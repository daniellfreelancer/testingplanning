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

const formatearFecha = (fecha) => {
  if (!fecha) return "No especificada";
  const fechaObj = new Date(fecha);
  const opciones = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return fechaObj.toLocaleString("es-CL", opciones);
};

/**
 * Envía email de notificación al profesional cuando el deportista ha llegado para su cita
 * @param {String} email - Email del profesional
 * @param {String} nombreDeportista - Nombre completo del deportista
 * @param {Object} cita - Objeto cita (ideal: populado con profesional y deportista)
 */
const sendEmailAsistenciaCita = async (email, nombreDeportista, cita) => {
  try {
    if (!cita || !cita._id) {
      console.log("Cita sin ID, no se envía email");
      return;
    }

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

    const nombreCompletoDeportista = nombreDeportista || "Deportista";
    const fechaFormateada = formatearFecha(cita.fecha);
    const especialidad = cita.especialidad || "No especificada";
    const tipoCita = cita.tipoCita || "No especificado";

    // Nombre del profesional (si viene populado)
    const profesionalNombre = cita.profesional
      ? `${cita.profesional.nombre || ""} ${cita.profesional.apellido || ""}`.trim() || "Profesional"
      : "Profesional";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Notificación de Asistencia - VitalMove</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" type="text/css">
        <style>
          body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Montserrat', sans-serif; -webkit-font-smoothing: antialiased; }
          table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          td { padding: 0; }
          a { text-decoration: none; color: #00d09c; }
          img { border: 0; display: block; max-width: 100%; }

          .email-wrapper { width: 100%; background-color: #f4f7f6; }
          .content-table { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

          .header { padding: 30px 20px; text-align: center; background-color: #ffffff; }
          .body-content { padding: 30px 40px; color: #333333; }

          .title { font-size: 28px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; line-height: 1.2; text-align: center; }
          .greeting-text { font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #555555; }

          .notification-box { background-color: #e8f5e9; border-left: 4px solid #00d09c; padding: 20px; margin: 25px 0; border-radius: 4px; }
          .notification-text { font-size: 18px; font-weight: 600; color: #2e7d32; text-align: center; margin: 0; }

          .details { background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0; }
          .row { margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
          .row:last-child { margin-bottom: 0; }
          .label { font-weight: 600; color: #333333; font-size: 14px; flex: 0 0 45%; }
          .value { color: #555555; font-size: 14px; flex: 1; text-align: right; }

          .footer { padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f7f6; }

          @media only screen and (max-width: 620px) {
            .content-table { width: 100% !important; border-radius: 0; box-shadow: none; }
            .body-content { padding: 20px 25px !important; }
            .title { font-size: 24px !important; }
            .details { padding: 20px !important; }
            .row { flex-direction: column; }
            .label { margin-bottom: 5px; }
            .value { text-align: left; }
          }
        </style>
      </head>
      <body>
        <center class="email-wrapper">
          <table class="content-table" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="header text-center align-middle flex justify-center items-center">
                <a href="https://vitalmoveglobal.com" target="_blank">
                  <img src="https://gestion.vitalmove.cl/static/media/logoVMDark.bfb629aa47764b494994.png" alt="VitalMove Logo" style="width:120px;height:auto;">
                </a>
              </td>
            </tr>

            <tr>
              <td class="body-content">
                <h1 class="title">Notificación de Asistencia</h1>
                <p class="greeting-text">Hola <strong>${profesionalNombre}</strong>,</p>
                
                <div class="notification-box">
                  <p class="notification-text">El deportista ha llegado para su cita</p>
                </div>

                <p class="greeting-text">El deportista <strong>${nombreCompletoDeportista}</strong> ha llegado y está esperando para su atención.</p>

                <div class="details">
                  <div class="row">
                    <span class="label">Deportista:</span>
                    <span class="value">${nombreCompletoDeportista}</span>
                  </div>
                  <div class="row">
                    <span class="label">Fecha y hora:</span>
                    <span class="value">${fechaFormateada}</span>
                  </div>
                  <div class="row">
                    <span class="label">Especialidad:</span>
                    <span class="value">${especialidad}</span>
                  </div>
                  <div class="row">
                    <span class="label">Tipo de cita:</span>
                    <span class="value">${tipoCita}</span>
                  </div>
                  ${cita.duracion ? `
                  <div class="row">
                    <span class="label">Duración:</span>
                    <span class="value">${cita.duracion} minutos</span>
                  </div>
                  ` : ''}
                </div>

                <p class="greeting-text" style="margin-top: 30px;">
                  Por favor, proceda con la atención del deportista.
                </p>

              </td>
            </tr>
          </table>

          <table class="footer" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px;">
            <tr>
              <td>
                <p style="margin: 0; padding: 10px 0;">© 2025 VitalMove. Todos los derechos reservados.</p>
              </td>
            </tr>
          </table>
        </center>
      </body>
      </html>
    `;

    await smtpTransport.sendMail({
      from: GOOGLE_USER,
      to: String(email).trim().toLowerCase(),
      subject: `Notificación: ${nombreCompletoDeportista} ha llegado para su cita`,
      html: htmlContent,
    });

    console.log(`Email de notificación de asistencia enviado exitosamente a: ${email}`);
  } catch (error) {
    console.error("Error al enviar email de asistencia a cita:", error);
    throw error;
  }
};

module.exports = sendEmailAsistenciaCita;