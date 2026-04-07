/**
 * Aviso simple de cancelación de reserva (Resend).
 */
const { Resend } = require("resend");

const { EMAIL_SERVICE_API_RESEND } = process.env;

const LOGO_PUENTE_ALTO = "https://deportespte.vitalmoveglobal.com/logos/ptealto.webp";

/**
 * @param {string} email
 * @param {string} nombreDestinatario - Nombre para el saludo
 */
const sendEmailCancelacionPteAlto = async (email, nombreDestinatario) => {
    try {
        if (!EMAIL_SERVICE_API_RESEND) {
            throw new Error("EMAIL_SERVICE_API_RESEND no está configurada");
        }

        const to = email && String(email).trim();
        if (!to) {
            console.log("Cancelación: sin email destinatario, no se envía aviso");
            return;
        }

        const nombre = nombreDestinatario && String(nombreDestinatario).trim() ? String(nombreDestinatario).trim() : "Usuario/a";

        const resend = new Resend(EMAIL_SERVICE_API_RESEND);

        const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reserva cancelada - Deportes Puente Alto</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Montserrat', sans-serif; }
            .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { padding: 30px 20px; text-align: center; }
            .header img { width: 120px; height: auto; }
            .body-content { padding: 20px 40px 40px; color: #333; }
            .title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 18px; }
            .text { font-size: 16px; line-height: 1.6; margin-bottom: 14px; color: #555; }
            .notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 22px 0; border-radius: 6px; font-size: 15px; color: #856404; }
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
              <p class="title">Reserva cancelada</p>
              <p class="text">Hola <strong>${nombre}</strong>,</p>
              <p class="text">Te informamos que <strong>tu reserva ha sido cancelada</strong>.</p>
              <div class="notice">
                Para más información, por favor <strong>contáctate con un administrador</strong> de la plataforma o de la Corporación de Deportes Puente Alto.
              </div>
              <p class="text">Si no solicitaste esta cancelación o tienes dudas, comunícate con nosotros a la brevedad.</p>
            </div>
            <div class="footer">
              Corporación de Deportes Puente Alto — Powered by VitalMove
            </div>
          </div>
        </body>
        </html>
      `;

        const { error } = await resend.emails.send({
            from: "Contacto <deportespuentealto@vitalmoveglobal.com>",
            to,
            subject: "Reserva cancelada - Deportes Puente Alto",
            html,
        });

        if (error) {
            throw new Error(
                `Resend no pudo enviar el correo de cancelación: ${error.message || "Error desconocido"}`
            );
        }

        console.log("Email de cancelación de reserva enviado a:", to);
    } catch (error) {
        console.error("Error enviando email de cancelación de reserva:", error);
        throw error; // el controller atrapa y no falla la cancelación HTTP
    }
};

module.exports = sendEmailCancelacionPteAlto;
