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

const escapeHtml = (value) => {
  const str = value === null || value === undefined ? "" : String(value);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const isPlainObject = (value) =>
  !!value && typeof value === "object" && !Array.isArray(value);

const normalizeEmail = (email) => {
  if (!email) return "";
  return String(email).trim().toLowerCase();
};

const renderObjectAsRows = (obj) => {
  const entries = Object.entries(obj || {}).filter(([, v]) => {
    if (v === null || v === undefined) return false;
    if (typeof v === "string" && v.trim() === "") return false;
    return true;
  });

  if (entries.length === 0) {
    return `<div style="color:#666666;font-size:14px;line-height:1.6;">(Sin información)</div>`;
  }

  const rows = entries
    .map(([k, v]) => {
      const key = escapeHtml(k);
      const val = isPlainObject(v) || Array.isArray(v) ? escapeHtml(JSON.stringify(v)) : escapeHtml(v);
      return `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #eef2f1;color:#1a1a1a;font-weight:600;font-size:13px;width:40%;">${key}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eef2f1;color:#333333;font-size:13px;">${val}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;">
      ${rows}
    </table>
  `;
};

const renderSection = (title, contentHtml) => `
  <div style="border:1px solid #e9efed;border-radius:10px;overflow:hidden;margin:14px 0;">
    <div style="background:#e4faf4;padding:12px 14px;">
      <div style="font-size:14px;font-weight:700;color:#1a1a1a;">${escapeHtml(title)}</div>
    </div>
    <div style="padding:14px;">
      ${contentHtml}
    </div>
  </div>
`;

const normalizePayload = (payload) => {
  const p = isPlainObject(payload) ? { ...payload } : {};

  // Asegurar datosRepresentante como objeto
  if (p.datosRepresentante && typeof p.datosRepresentante === "string") {
    try {
      p.datosRepresentante = JSON.parse(p.datosRepresentante);
    } catch {
      // se mantiene como string; el helper hará fallback a toEmail
    }
  }

  // Compat: algunos clientes pueden mandar otros nombres de campos
  if (isPlainObject(p.datosRepresentante)) {
    if (!p.datosRepresentante.email && p.datosRepresentante.emailRepresentative) {
      p.datosRepresentante.email = p.datosRepresentante.emailRepresentative;
    }
    if (!p.datosRepresentante.nombre && p.datosRepresentante.nameRepresentative) {
      p.datosRepresentante.nombre = p.datosRepresentante.nameRepresentative;
    }
    if (!p.datosRepresentante.apellido && p.datosRepresentante.lastNameRepresentative) {
      p.datosRepresentante.apellido = p.datosRepresentante.lastNameRepresentative;
    }
  }

  // Asegurar toEmail como fallback explícito
  if (!p.toEmail && isPlainObject(p.datosRepresentante) && p.datosRepresentante.email) {
    p.toEmail = p.datosRepresentante.email;
  }

  return p;
};

/**
 * Envia correo de confirmación al usuario que realizó la inscripción en escuela de fútbol.
 *
 * Debe recibir por params:
 * - Datos del estudiante
 * - Escuela de futbol
 * - Categoria asignada
 * - Datos del representante
 *
 * @param {Object} params
 * @param {string} [params.toEmail] Email destino (si no se envía, se usa datosRepresentante.email)
 * @param {Object|string} params.datosEstudiante
 * @param {Object|string} params.escuelaFutbol
 * @param {Object|string} params.categoriaAsignada
 * @param {Object|string} params.datosRepresentante
 */
const sendStudentFutbolWelcomeMail = async ({
  toEmail,
  datosEstudiante,
  escuelaFutbol,
  categoriaAsignada,
  datosRepresentante,
}) => {
  const oauth2Client = new OAuth2(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_URL);
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH });

  // En algunos archivos del proyecto se usa GOOGLE_ACCESS directo.
  // Mantenemos el mismo patrón para consistencia.
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

  const representanteEmail = normalizeEmail(
    toEmail || (isPlainObject(datosRepresentante) ? datosRepresentante.email : "")
  );

  if (!representanteEmail) {
    throw new Error("Falta email destino. Envía `toEmail` o `datosRepresentante.email`.");
  }

  const representanteNombre =
    (isPlainObject(datosRepresentante) && (datosRepresentante.nombre || datosRepresentante.name)) ||
    "Hola";

  const estudianteNombre =
    (isPlainObject(datosEstudiante) && (datosEstudiante.nombre || datosEstudiante.name)) ||
    "";

  const estudianteContent = isPlainObject(datosEstudiante)
    ? renderObjectAsRows(datosEstudiante)
    : `<div style="color:#333333;font-size:14px;line-height:1.6;">${escapeHtml(
        datosEstudiante
      )}</div>`;

  const escuelaContent = isPlainObject(escuelaFutbol)
    ? renderObjectAsRows(escuelaFutbol)
    : `<div style="color:#333333;font-size:14px;line-height:1.6;">${escapeHtml(
        escuelaFutbol
      )}</div>`;

  const categoriaContent = isPlainObject(categoriaAsignada)
    ? renderObjectAsRows(categoriaAsignada)
    : `<div style="color:#333333;font-size:14px;line-height:1.6;">${escapeHtml(
        categoriaAsignada
      )}</div>`;

  const representanteContent = isPlainObject(datosRepresentante)
    ? renderObjectAsRows(datosRepresentante)
    : `<div style="color:#333333;font-size:14px;line-height:1.6;">${escapeHtml(
        datosRepresentante
      )}</div>`;

  const mailOptionsTemplate = {
    from: GOOGLE_USER,
    to: representanteEmail,
    subject: "Confirmación de inscripción - Escuela de Fútbol",
    html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Confirmación de inscripción</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" type="text/css">
          <style>
            body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Montserrat', sans-serif; -webkit-font-smoothing: antialiased; }
            table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            td { padding: 0; }
            a { text-decoration: none; color: #00d09c; }
            img { border: 0; display: block; max-width: 100%; }

            .email-wrapper { width: 100%; background-color: #f4f7f6; }
            .content-table { width: 100%; max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { padding: 26px 20px; text-align: center; }
            .body-content { padding: 18px 26px 26px 26px; text-align: left; color: #333333; }

            .title { font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0; line-height: 1.2; }
            .text { font-size: 14px; line-height: 1.7; margin: 0 0 10px 0; color: #333333; }
            .muted { color: #666666; }
            .pill { display:inline-block; background:#e4faf4; color:#0b7f66; padding:6px 10px; border-radius:999px; font-size:12px; font-weight:700; }

            .footer { padding: 22px 20px; text-align: center; font-size: 12px; color: #888888; }
            .footer-link { color: #888888; text-decoration: underline; }

            @media only screen and (max-width: 680px) {
              .content-table { width: 100% !important; border-radius: 0; box-shadow: none; }
              .body-content { padding: 16px 18px 22px 18px !important; }
              .title { font-size: 20px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Montserrat', sans-serif;">
          <center class="email-wrapper">
            <table class="content-table" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td class="header">
                  <a href="https://vitalmoveglobal.com" target="_blank" rel="noopener">
                    <img src="https://gestion.vitalmove.cl/static/media/logoVMDark.bfb629aa47764b494994.png" alt="VitalMove Logo" style="width:140px;height:auto;margin:0 auto;">
                  </a>
                </td>
              </tr>

              <tr>
                <td class="body-content">
                  <div class="pill">Inscripción recibida</div>
                  <div style="height:10px;"></div>

                  <p class="title">Confirmación de inscripción${estudianteNombre ? `: ${escapeHtml(estudianteNombre)}` : ""}</p>
                  <p class="text">Hola <strong>${escapeHtml(representanteNombre)}</strong>,</p>
                  <p class="text muted">
                    Hemos recibido la inscripción a la <strong>Escuela de Fútbol</strong>. A continuación te dejamos el resumen de la información registrada.
                  </p>

                  ${renderSection("Datos del estudiante", estudianteContent)}
                  ${renderSection("Escuela de futbol", escuelaContent)}
                  ${renderSection("Categoria asignada", categoriaContent)}
                  ${renderSection("Datos del representante", representanteContent)}

                  <p class="text muted" style="margin-top:14px;">
                    Si detectas algún dato incorrecto, responde este correo para poder corregirlo.
                  </p>
                </td>
              </tr>
            </table>

            <table class="footer" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 640px;">
              <tr>
                <td>
                  <p style="margin: 0; padding: 14px 0;">
                    Visítanos en <a href="https://vitalmoveglobal.com" class="footer-link" target="_blank" rel="noopener">www.vitalmoveglobal.com</a>
                  </p>
                  <p style="margin: 0;">© 2026 VitalMove. Todos los derechos reservados.</p>
                </td>
              </tr>
            </table>
          </center>
        </body>
        </html>
      `,
  }

  await smtpTransport.sendMail(mailOptionsTemplate);
  return true;
};

// Handler Express para la ruta /email-student-futbol/send-welcome-email-student-futbol
const emailStudentFutbolWelcomeHandler = async (req, res) => {
  try {
    console.log("[EMAIL WELCOME] Iniciando envío de correo de bienvenida");
    console.log("[EMAIL WELCOME] Payload recibido:", JSON.stringify(req.body, null, 2));
    
    const payload = normalizePayload(req.body);
    console.log("[EMAIL WELCOME] Payload normalizado:", JSON.stringify(payload, null, 2));
    
    await sendStudentFutbolWelcomeMail(payload);
    
    console.log("[EMAIL WELCOME] Correo enviado exitosamente");
    return res.status(200).json({
      success: true,
      message: "Email inscripción escuela fútbol enviado con éxito",
    });
  } catch (error) {
    console.error("[EMAIL WELCOME] Error al intentar enviar el email:", error?.message || error);
    return res.status(400).json({
      success: false,
      message: error?.message || "Error al intentar enviar el email",
    });
  }
};

module.exports = emailStudentFutbolWelcomeHandler;
