// car/email/emailreservaQR.js
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const QRCode = require("qrcode");

const {
  GOOGLE_USER,
  GOOGLE_ID,
  GOOGLE_SECRET,
  GOOGLE_REFRESH,
  GOOGLE_URL,
  GOOGLE_ACCESS,
  // recomendado: base URL para validar cita
  CITA_QR_BASE_URL, // ej: https://api.vitalmoveglobal.com/citas/validar-cita
} = process.env;

const { formatForDisplay } = require("../../../utils/dateUtils");

const formatearFecha = (fecha) => {
  if (!fecha) return "No especificada";
  return formatForDisplay(fecha, true);
};

const generarQRCode = async (texto) => {
  try {
    const qrBuffer = await QRCode.toBuffer(texto, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 300,
      margin: 2,
    });
    return qrBuffer;
  } catch (error) {
    console.error("Error al generar QR code:", error);
    return null;
  }
};

/**
 * Envía email de confirmación de CITA con QR
 * @param {String} email - Email del deportista
 * @param {String} nombreDeportista - Nombre del deportista
 * @param {Object} cita - Objeto cita (ideal: populado con profesional y deportista)
 */
const sendEmailCitaQR = async (email, nombreDeportista, cita) => {
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

    const citaId = cita._id.toString();

    // URL que quieres “pasar a QR”
    const baseUrl = CITA_QR_BASE_URL || "https://api.vitalmoveglobal.com/citas/validar-cita";
    const qrUrl = `${baseUrl}/${citaId}`;

    const qrCodeBuffer = await generarQRCode(qrUrl);

    const nombreCompletoDeportista = nombreDeportista || "Usuario";
    const fechaFormateada = formatearFecha(cita.fecha);
    const especialidad = cita.especialidad || "No especificada";

    // nombre del profesional (si viene populado)
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
        <title>Confirmación de Cita - VitalMove</title>
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

          .details { background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0; }
          .row { margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
          .row:last-child { margin-bottom: 0; }
          .label { font-weight: 600; color: #333333; font-size: 14px; flex: 0 0 45%; }
          .value { color: #555555; font-size: 14px; flex: 1; text-align: right; }

          .qr-section { text-align: center; padding: 30px 0; border-top: 2px solid #e4faf4; margin-top: 30px; }
          .qr-title { font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 15px; }
          .qr-code-wrapper { display: inline-block; padding: 15px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .qr-code-img { width: 250px; height: 250px; }
          .qr-instructions { font-size: 14px; color: #666666; margin-top: 15px; line-height: 1.5; }

          .footer { padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f7f6; }

          @media only screen and (max-width: 620px) {
            .content-table { width: 100% !important; border-radius: 0; box-shadow: none; }
            .body-content { padding: 20px 25px !important; }
            .title { font-size: 24px !important; }
            .details { padding: 20px !important; }
            .row { flex-direction: column; }
            .label { margin-bottom: 5px; }
            .value { text-align: left; }
            .qr-code-img { width: 200px; height: 200px; }
          }
        </style>
      </head>
      <body>
        <center class="email-wrapper">
          <table class="content-table" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="header">
                <a href="https://vitalmoveglobal.com" target="_blank">
                  <img src="https://gestion.vitalmove.cl/static/media/logoVMDark.bfb629aa47764b494994.png" alt="VitalMove Logo" style="width:120px;height:auto;">
                </a>
              </td>
            </tr>

            <tr>
              <td class="body-content">
                <h1 class="title">¡Cita Confirmada!</h1>
                <p class="greeting-text">Hola <strong>${nombreCompletoDeportista}</strong>,</p>
                <p class="greeting-text">Tu cita ha sido confirmada. Aquí tienes el comprobante:</p>

                <div class="details">
                  <div class="row">
                    <span class="label">Fecha:</span>
                    <span class="value">${fechaFormateada}</span>
                  </div>
                  <div class="row">
                    <span class="label">Especialidad:</span>
                    <span class="value">${especialidad}</span>
                  </div>
                  <div class="row">
                    <span class="label">Profesional:</span>
                    <span class="value">${profesionalNombre}</span>
                  </div>
                  <div class="row">
                    <span class="label">Tipo de cita:</span>
                    <span class="value">${cita.tipoCita || "No especificado"}</span>
                  </div>
                  <div class="row">
                    <span class="label">Duración:</span>
                    <span class="value">${cita.duracion ? `${cita.duracion} min` : "No especificada"}</span>
                  </div>
                </div>

                <div class="qr-section">
                  <p class="qr-title">Código QR de Validación</p>
                  ${
                    qrCodeBuffer
                      ? `
                        <div class="qr-code-wrapper">
                          <img src="cid:qr-code" alt="Código QR de Cita" class="qr-code-img" />
                        </div>
                        <p class="qr-instructions">
                          Presenta este código QR al llegar para validar tu cita.
                        </p>
                        <p class="qr-instructions" style="margin-top:10px;">
                          URL de validación: <a href="${qrUrl}" target="_blank">${qrUrl}</a>
                        </p>
                      `
                      : `
                        <p class="qr-instructions" style="color:#ff6b6b;">
                          No se pudo generar el código QR. Por favor, contacta con soporte.
                        </p>
                      `
                  }
                </div>

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

    const attachments = [];
    if (qrCodeBuffer) {
      attachments.push({
        filename: "qr-cita.png",
        content: qrCodeBuffer,
        cid: "qr-code",
      });
    }

    await smtpTransport.sendMail({
      from: GOOGLE_USER,
      to: String(email).trim().toLowerCase(),
      subject: `Confirmación de Cita - ${especialidad}`,
      html: htmlContent,
      attachments,
    });

    console.log(`Email de confirmación de cita enviado exitosamente a: ${email}`);
  } catch (error) {
    console.error("Error al enviar email de cita:", error);
    throw error;
  }
};

module.exports = sendEmailCitaQR;
