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
} = process.env;

/**
 * Formatea una fecha a formato legible en español
 */
const formatearFecha = (fecha) => {
    if (!fecha) return "No especificada";
    const fechaObj = new Date(fecha);
    const opciones = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return fechaObj.toLocaleString('es-CL', opciones);
};

/**
 * Genera un código QR como buffer (para adjuntar en email)
 */
const generarQRCode = async (texto) => {
    try {
        const qrBuffer = await QRCode.toBuffer(texto, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 2
        });
        return qrBuffer;
    } catch (error) {
        console.error("Error al generar QR code:", error);
        return null;
    }
};

/**
 * Obtiene el nombre del espacio o taller de la reserva
 */
const obtenerNombreRecurso = (reserva) => {
    if (reserva.tipoReserva === 'taller' && reserva.taller) {
        return reserva.taller.nombre || 'Taller';
    }
    if (reserva.espacioDeportivo) {
        return reserva.espacioDeportivo.nombre || 'Espacio Deportivo';
    }
    return 'Recurso Deportivo';
};

/**
 * Obtiene el tipo de reserva en texto legible
 */
const obtenerTipoReservaTexto = (reserva) => {
    if (reserva.tipoReserva === 'taller') {
        return 'Taller Deportivo';
    }
    return 'Espacio Deportivo';
};

/**
 * Envía email de confirmación de reserva con QR code
 * @param {String} email - Email del usuario
 * @param {String} nombreUsuario - Nombre del usuario
 * @param {Object} reserva - Objeto de reserva (debe estar populado con espacioDeportivo/taller y usuario)
 */
const sendEmailReservaPteAlto = async (email, nombreUsuario, reserva) => {
    try {
        // Validar que la reserva tenga usuario y sea tipo 'usuario'
        if (!reserva.usuario || !reserva._id) {
            console.log("Reserva sin usuario o sin ID, no se envía email");
            return;
        }

        // Validar que sea tipoReservaInterna 'usuario' si es reserva interna
        if (reserva.esReservaInterna && reserva.tipoReservaInterna !== 'usuario') {
            console.log("Reserva interna no es tipo 'usuario', no se envía email");
            return;
        }

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

        // Generar URL para el QR code
        const reservaId = reserva._id.toString();
        const qrUrl = `https://api.vitalmoveglobal.com/reservas-pte-alto/validar-reserva/${reservaId}`;
        
        // Generar QR code como buffer
        const qrCodeBuffer = await generarQRCode(qrUrl);

        // Preparar datos de la reserva
        const nombreRecurso = obtenerNombreRecurso(reserva);
        const tipoReservaTexto = obtenerTipoReservaTexto(reserva);
        const fechaInicioFormateada = formatearFecha(reserva.fechaInicio);
        const fechaFinFormateada = formatearFecha(reserva.fechaFin);
        const nombreCompleto = nombreUsuario || 'Usuario';

        // Construir HTML del email
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <title>Confirmación de Reserva - VitalMove</title>
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
                .header { padding: 30px 20px; text-align: center; background-color: #ffffff; }
                .logo-img { width: 120px; height: auto; }
    
                /* Body */
                .body-content { padding: 30px 40px; color: #333333; }
                .title { font-size: 28px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; line-height: 1.2; text-align: center; }
                .greeting-text { font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #555555; }
                
                /* Reservation Details */
                .reservation-details { background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0; }
                .detail-row { margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
                .detail-row:last-child { margin-bottom: 0; }
                .detail-label { font-weight: 600; color: #333333; font-size: 14px; flex: 0 0 40%; }
                .detail-value { color: #555555; font-size: 14px; flex: 1; text-align: right; }
                
                /* QR Code Section */
                .qr-section { text-align: center; padding: 30px 0; border-top: 2px solid #e4faf4; margin-top: 30px; }
                .qr-title { font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 15px; }
                .qr-code-wrapper { display: inline-block; padding: 15px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .qr-code-img { width: 250px; height: 250px; }
                .qr-instructions { font-size: 14px; color: #666666; margin-top: 15px; line-height: 1.5; }
    
                /* Button */
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
    
                /* Footer */
                .footer { padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f7f6; }
                .footer-link { color: #888888; text-decoration: underline; }
    
                /* Mobile adjustments */
                @media only screen and (max-width: 620px) {
                  .content-table { width: 100% !important; border-radius: 0; box-shadow: none; }
                  .body-content { padding: 20px 25px !important; }
                  .title { font-size: 24px !important; }
                  .reservation-details { padding: 20px !important; }
                  .detail-row { flex-direction: column; }
                  .detail-label { margin-bottom: 5px; }
                  .detail-value { text-align: left; }
                  .qr-code-img { width: 200px; height: 200px; }
                }
              </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Montserrat', sans-serif;">
              <center class="email-wrapper">
                <table class="content-table" align="center" justify="center" role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <!-- Header -->
                  <tr>
                    <td class="header">
                      <a href="https://deportespte.vitalmoveglobal.com" target="_blank">
                        <img class="logo-img" src="https://deportespte.vitalmoveglobal.com/logos/ptealto.webp" alt="VitalMove Logo">
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Body Content -->
                  <tr>
                    <td class="body-content">
                      <h1 class="title">¡Reserva Confirmada!</h1>
                      <p class="greeting-text">Hola <strong>${nombreCompleto}</strong>,</p>
                      <p class="greeting-text">Tu reserva ha sido confirmada exitosamente. A continuación encontrarás los detalles de tu reserva:</p>
                      
                      <!-- Reservation Details -->
                      <div class="reservation-details">
                        <div class="detail-row">
                          <span class="detail-label">Tipo de Reserva:</span>
                          <span class="detail-value">${tipoReservaTexto}</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">${reserva.tipoReserva === 'taller' ? 'Taller:' : 'Espacio:'}</span>
                          <span class="detail-value">${nombreRecurso}</span>
                        </div>
                        ${reserva.espacioDeportivo && reserva.espacioDeportivo.deporte ? `
                        <div class="detail-row">
                          <span class="detail-label">Deporte:</span>
                          <span class="detail-value">${reserva.espacioDeportivo.deporte}</span>
                        </div>
                        ` : ''}
                        <div class="detail-row">
                          <span class="detail-label">Fecha de Inicio:</span>
                          <span class="detail-value">${fechaInicioFormateada}</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">Fecha de Fin:</span>
                          <span class="detail-value">${fechaFinFormateada}</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">Estado:</span>
                          <span class="detail-value" style="color: #00d09c; font-weight: 600;">${reserva.estado === 'activa' ? 'Activa' : reserva.estado}</span>
                        </div>
                        ${reserva.notas ? `
                        <div class="detail-row">
                          <span class="detail-label">Notas:</span>
                          <span class="detail-value">${reserva.notas}</span>
                        </div>
                        ` : ''}
                      </div>
                      
                      <!-- QR Code Section -->
                      <div class="qr-section">
                        <p class="qr-title">Código QR de Validación</p>
                        ${qrCodeBuffer ? `
                        <div class="qr-code-wrapper">
                          <img src="cid:qr-code" alt="Código QR de Reserva" class="qr-code-img" />
                        </div>
                        <p class="qr-instructions">
                          Presenta este código QR al llegar al establecimiento para validar tu reserva.
                        </p>
                        ` : `
                        <p class="qr-instructions" style="color: #ff6b6b;">
                          No se pudo generar el código QR. Por favor, contacta con soporte.
                        </p>
                        `}
                      </div>
                      

                    </td>
                  </tr>
                </table>
    
                <!-- Footer -->
                <table class="footer" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px;">
                  <tr>
                    <td>
                      <p style="margin: 0; padding: 10px 0;">Visítanos en <a href="https://vitalmoveglobal.com" class="footer-link" target="_blank">www.vitalmoveglobal.com</a></p>
                      <p style="margin: 0; padding: 10px 0;">© 2025 VitalMove. Todos los derechos reservados.</p>
                      <p style="margin: 15px 0 0 0; padding: 10px 0; font-size: 11px; color: #aaaaaa;">
                        Si tienes alguna pregunta sobre tu reserva, por favor contacta con nuestro equipo de soporte.
                      </p>
                    </td>
                  </tr>
                </table>
              </center>
            </body>
            </html>
        `;

        // Preparar attachments para el QR code
        const attachments = [];
        if (qrCodeBuffer) {
            attachments.push({
                filename: 'qr-reserva.png',
                content: qrCodeBuffer,
                cid: 'qr-code' // Content-ID para referenciar en el HTML
            });
        }

        const mailOptions = {
            from: GOOGLE_USER,
            to: email,
            subject: `Confirmación de Reserva - ${nombreRecurso}`,
            html: htmlContent,
            attachments: attachments
        };

        await smtpTransport.sendMail(mailOptions);
        console.log(`Email de confirmación de reserva enviado exitosamente a: ${email}`);
    } catch (error) {
        console.error("Error al enviar email de reserva:", error);
        throw error;
    }
};

module.exports = sendEmailReservaPteAlto;
