const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const {
  GOOGLE_USER,
  GOOGLE_ID,
  GOOGLE_SECRET,
  GOOGLE_URL,
  GOOGLE_REFRESH,
  GOOGLE_ACCESS,
} = process.env;

const { formatForDisplay } = require("../../../utils/dateUtils");

/**
 * Formatea una fecha a formato legible (DD/MM/YYYY) de forma consistente
 */
const formatearFecha = (fecha) => {
  if (!fecha) return "No especificada";
  return formatForDisplay(fecha, false);
};

/**
 * Envía email de confirmación de inscripción a taller deportivo (Puente Alto).
 * Incluye resumen del taller y botón/link para darse de baja (anular inscripción).
 *
 * @param {String} email - Email del usuario
 * @param {String} nombreUsuario - Nombre del usuario
 * @param {Object} taller - Objeto del taller (debe estar populado con complejo, sede, espacioDeportivo para mostrar sede/complejo/espacio y dirección)
 * @param {String} usuarioId - _id del usuario (para construir el link de baja)
 */
const sendEmailInscripcionTallerPteAlto = async (email, nombreUsuario, taller, usuarioId) => {
  try {
    if (!email || !taller || !usuarioId) {
      console.log("sendEmailInscripcionTallerPteAlto: faltan email, taller o usuarioId");
      return;
    }

    const oauth2Client = new OAuth2(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_URL);
    oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH });
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
      tls: { rejectUnauthorized: false },
    });

    const tallerId = (taller._id || taller.id).toString();
    const usuarioIdStr = usuarioId.toString();
    const nombreCompleto = nombreUsuario || "Usuario";
    const nombreTaller = taller.nombre || "Taller Deportivo";
    const fechaInicioFormateada = formatearFecha(taller.fechaInicio);
    const fechaFinFormateada = formatearFecha(taller.fechaFin);

    // Sede o complejo (pueden estar populados como objeto o ser solo ObjectId)
    const sede = taller.sede && typeof taller.sede === "object" ? taller.sede : null;
    const complejo = taller.complejo && typeof taller.complejo === "object" ? taller.complejo : null;
    const espaciosDeportivos = Array.isArray(taller.espacioDeportivo) ? taller.espacioDeportivo : [];
    const espaciosPopulados = espaciosDeportivos.filter((e) => e && typeof e === "object");

    const nombreSede = sede && sede.nombre;
    const nombreComplejo = complejo && complejo.nombre;
    const direccionSede = sede && sede.direccion;
    const direccionComplejo = complejo && complejo.direccion;
    const primeraDireccionEspacio = espaciosPopulados.map((e) => e.direccion).find(Boolean);
    const direccionMostrar = direccionSede || direccionComplejo || primeraDireccionEspacio || null;

    const nombresEspacios = espaciosPopulados.map((e) => e.nombre || "Espacio").join(", ") || null;

    // Link para anular inscripción: lleva al frontend con tallerId y usuarioId; el frontend debe llamar a POST /td-pte-alto/desinscribirse-taller/:tallerId/:usuarioId
    const baseUrl = process.env.FRONTEND_URL || "https://deportespte.vitalmoveglobal.com";
    const urlAnularInscripcion = `${baseUrl}/anular-inscripcion-taller?tallerId=${tallerId}&usuarioId=${usuarioIdStr}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Confirmación de Inscripción al Taller - VitalMove</title>
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
          .logo-img { width: 120px; height: auto; }

          .body-content { padding: 30px 40px; color: #333333; }
          .title { font-size: 28px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; line-height: 1.2; text-align: center; }
          .greeting-text { font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #555555; }

          .reservation-details { background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0; }
          .detail-row { margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
          .detail-row:last-child { margin-bottom: 0; }
          .detail-label { font-weight: 600; color: #333333; font-size: 14px; flex: 0 0 40%; }
          .detail-value { color: #555555; font-size: 14px; flex: 1; text-align: right; }

          .button-wrapper { text-align: center; margin: 30px 0; }
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
          }
          .button:hover { background-color: #00b080; }

          .button-baja-wrapper { text-align: center; margin: 25px 0 15px 0; padding-top: 20px; border-top: 1px solid #e8e8e8; }
          .button-baja {
            display: inline-block;
            padding: 12px 24px;
            background-color: #ffffff;
            color: #666666 !important;
            font-size: 14px;
            font-weight: 600;
            border-radius: 5px;
            text-decoration: none;
            border: 1px solid #ddd;
            transition: background-color 0.2s ease, color 0.2s ease;
          }
          .button-baja:hover { background-color: #f8f9fa; color: #333333 !important; }

          .footer { padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f7f6; }
          .footer-link { color: #888888; text-decoration: underline; }

          @media only screen and (max-width: 620px) {
            .content-table { width: 100% !important; border-radius: 0; box-shadow: none; }
            .body-content { padding: 20px 25px !important; }
            .title { font-size: 24px !important; }
            .reservation-details { padding: 20px !important; }
            .detail-row { flex-direction: column; }
            .detail-label { margin-bottom: 5px; }
            .detail-value { text-align: left; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Montserrat', sans-serif;">
        <center class="email-wrapper">
          <table class="content-table" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="header">
                <a href="https://deportespte.vitalmoveglobal.com" target="_blank">
                  <img class="logo-img" src="https://deportespte.vitalmoveglobal.com/logos/ptealto.webp" alt="VitalMove Logo">
                </a>
              </td>
            </tr>
            <tr>
              <td class="body-content">
                <h1 class="title">¡Inscripción al taller confirmada!</h1>
                <p class="greeting-text">Hola <strong>${nombreCompleto}</strong>,</p>
                <p class="greeting-text">Te has inscrito correctamente al taller. A continuación el resumen de tu inscripción:</p>

                <div class="reservation-details">
                  <div class="detail-row">
                    <span class="detail-label">Nombre:</span>
                    <span class="detail-value">${nombreTaller}</span>
                  </div>
                  ${taller.deporte ? `
                  <div class="detail-row">
                    <span class="detail-label">Deporte:</span>
                    <span class="detail-value">${taller.deporte}</span>
                  </div>
                  ` : ""}
                  ${taller.descripcion ? `
                  <div class="detail-row">
                    <span class="detail-label">Descripción:</span>
                    <span class="detail-value">${taller.descripcion}</span>
                  </div>
                  ` : ""}
                  <div class="detail-row">
                    <span class="detail-label">Fecha inicio:</span>
                    <span class="detail-value">${fechaInicioFormateada}</span>
                  </div>
                  ${nombreSede ? `
                  <div class="detail-row">
                    <span class="detail-label">Sede:</span>
                    <span class="detail-value">${nombreSede}</span>
                  </div>
                  ` : ""}
                  ${nombreComplejo ? `
                  <div class="detail-row">
                    <span class="detail-label">Complejo:</span>
                    <span class="detail-value">${nombreComplejo}</span>
                  </div>
                  ` : ""}
                  ${nombresEspacios ? `
                  <div class="detail-row">
                    <span class="detail-label">Espacio deportivo:</span>
                    <span class="detail-value">${nombresEspacios}</span>
                  </div>
                  ` : ""}
                  ${direccionMostrar ? `
                  <div class="detail-row">
                    <span class="detail-label">Dirección:</span>
                    <span class="detail-value">${direccionMostrar}</span>
                  </div>
                  ` : ""}
                  <div class="detail-row">
                    <span class="detail-label">Fecha fin:</span>
                    <span class="detail-value">${fechaFinFormateada}</span>
                  </div>
                 
                </div>

                <p class="greeting-text">Si ya no puedes participar, puedes anular tu inscripción haciendo clic en el siguiente botón:</p>

                <div class="button-baja-wrapper">
                  <a href="${urlAnularInscripcion}" class="button-baja" target="_blank">Darse de baja - Anular mi inscripción</a>
                </div>
                <p style="font-size: 12px; color: #888888; text-align: center; margin: 0;">
                  Este enlace te llevará a la página para confirmar la anulación de tu inscripción.
                </p>
              </td>
            </tr>
          </table>

          <table class="footer" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px;">
            <tr>
              <td>
                <p style="margin: 0; padding: 10px 0;">Visítanos en <a href="https://vitalmoveglobal.com" class="footer-link" target="_blank">www.vitalmoveglobal.com</a></p>
                <p style="margin: 0; padding: 10px 0;">© 2025 VitalMove. Todos los derechos reservados.</p>
                <p style="margin: 15px 0 0 0; padding: 10px 0; font-size: 11px; color: #aaaaaa;">
                  Si tienes dudas sobre tu inscripción, contacta con nuestro equipo de soporte.
                </p>
              </td>
            </tr>
          </table>
        </center>
      </body>
      </html>
    `;

    const mailOptions = {
      from: GOOGLE_USER,
      to: email,
      subject: `Confirmación de inscripción - ${nombreTaller}`,
      html: htmlContent,
    };

    await smtpTransport.sendMail(mailOptions);
    console.log(`Email de confirmación de inscripción al taller enviado a: ${email}`);
  } catch (error) {
    console.error("Error al enviar email de inscripción al taller:", error);
    throw error;
  }
};

module.exports = sendEmailInscripcionTallerPteAlto;
