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

/**
 * Envía las credenciales (email + contraseña) al admin externo.
 * Usa el mismo sistema de correo que patentes (Gmail OAuth2).
 * @param {string} toEmail - Email del destinatario
 * @param {string} nombreCompleto - Nombre y apellido
 * @param {string} password - Contraseña en texto plano (solo para este envío)
 * @param {string} [nombreArrendatario] - Nombre de la institución/arrendatario
 * @returns {Promise<boolean>}
 */
const sendCredencialesAdminExterno = async (
  toEmail,
  nombreCompleto,
  password,
  nombreArrendatario = ""
) => {
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

    const currentDate = new Date().toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const mailOptions = {
      from: GOOGLE_USER,
      to: toEmail,
      subject: "Credenciales de acceso - Admin Externo - Piscina Temperada de Santiago",
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Credenciales de acceso</title>
  <style>
    body { margin:0; padding:0; background:#f5f6f7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color:#1f2937; line-height:1.5; }
    .wrapper { width:100%; max-width:560px; margin:0 auto; padding:24px; }
    .card { background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1); }
    .header { text-align:center; border-bottom:2px solid #2563eb; padding:20px; background:#fff; }
    .title { font-size:18px; font-weight:700; color:#1f2937; margin:0 0 8px 0; }
    .subtitle { font-size:13px; color:#6b7280; margin:0; }
    .date { font-size:11px; color:#9ca3af; margin:8px 0 0 0; }
    .content { padding:20px; }
    .intro { background:#f3f4f6; padding:14px; border-radius:6px; font-size:13px; margin-bottom:16px; }
    .section-title { font-size:14px; font-weight:700; color:#1f2937; margin:0 0 12px 0; padding-bottom:6px; border-bottom:1px solid #e5e7eb; }
    .field-group { margin-bottom:12px; }
    .label { font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 4px 0; }
    .value { font-size:14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:10px 12px; margin:0; font-family:monospace; word-break:break-all; }
    .password-box { background:#fef3c7; border:1px solid #f59e0b; border-radius:6px; padding:14px; margin:12px 0; }
    .password-box .value { background:#fff; }
    .footer { text-align:center; border-top:1px solid #e5e7eb; color:#9ca3af; font-size:11px; padding:12px; background:#f9fafb; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <p class="title">Credenciales de acceso</p>
        <p class="subtitle">Piscina Olímpica Temperada de Santiago - Admin Externo</p>
        <p class="date">Fecha: ${currentDate}</p>
      </div>
      <div class="content">
        <p class="intro">
          Hola${nombreCompleto ? ` ${nombreCompleto}` : ""}. Se han generado sus credenciales de acceso al sistema de administración externa.
        </p>
        <p class="section-title">Datos de acceso</p>
        <div class="field-group">
          <p class="label">Correo electrónico (usuario)</p>
          <p class="value">${toEmail || "—"}</p>
        </div>
        ${nombreArrendatario ? `
        <div class="field-group">
          <p class="label">Institución / Arrendatario</p>
          <p class="value">${nombreArrendatario}</p>
        </div>` : ""}
        <div class="password-box">
          <p class="label">Contraseña temporal</p>
          <p class="value">${password || "—"}</p>
        </div>
        <p style="font-size:12px; color:#6b7280; margin:12px 0 0 0;">
          Guarde esta contraseña en un lugar seguro. Si la pierde, puede solicitar un reenvío desde el panel de administración.
        </p>
      </div>
      <div class="footer">
        <p style="margin:0;">Documento generado automáticamente - ${currentDate}</p>
      </div>
    </div>
  </div>
</body>
</html>
      `,
    };

    await smtpTransport.sendMail(mailOptions);
    console.log("Email de credenciales admin externo enviado a:", toEmail);
    return true;
  } catch (error) {
    console.error("Error al enviar email credenciales admin externo:", error.message);
    return false;
  }
};

module.exports = sendCredencialesAdminExterno;
