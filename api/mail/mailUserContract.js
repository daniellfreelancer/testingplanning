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

const sendMailUserContract = async (user) => {
  try {
    const oauth2Client = new OAuth2(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_URL);

    oauth2Client.setCredentials({
      refresh_token: GOOGLE_REFRESH,
    });

    const accessToken = await oauth2Client.getAccessToken();
    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: GOOGLE_USER,
          type: 'OAuth2',
          clientId: GOOGLE_ID,
          clientSecret: GOOGLE_SECRET,
          refreshToken: GOOGLE_REFRESH,
          accessToken: GOOGLE_ACCESS
      },
      tls: {
          rejectUnauthorized: false
      }
  })

    // Función para renderizar campos condicionales
    const renderField = (label, value, type = 'text') => {
      if (value !== undefined && value !== null && value !== '') {
        if (type === 'boolean') {
          return `<tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: 600; width: 40%;">${label}:</td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${value ? 'Sí' : 'No'}</td></tr>`;
        } else if (type === 'date') {
          return `<tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: 600; width: 40%;">${label}:</td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${new Date(value).toLocaleDateString('es-CL')}</td></tr>`;
        } else if (type === 'array') {
          if (Array.isArray(value) && value.length > 0) {
            return `<tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: 600; width: 40%;">${label}:</td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${value.join(', ')}</td></tr>`;
          }
          return '';
        } else {
          return `<tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: 600; width: 40%;">${label}:</td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${value}</td></tr>`;
        }
      }
      return '';
    };

    const mailOptionsTemplate = {
      from: GOOGLE_USER,
      to: user.email,
      subject: "Copia de Contrato - VitalMove",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Copia de Contrato - VitalMove</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" type="text/css">
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              background-color: #f4f7f6; 
              font-family: 'Montserrat', sans-serif; 
              -webkit-font-smoothing: antialiased; 
              color: #333333;
            }
            table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            td { padding: 0; }
            img { border: 0; display: block; max-width: 100%; }
            
            .email-wrapper { width: 100%; background-color: #f4f7f6; }
            .content-table { 
              width: 100%; 
              max-width: 800px; 
              margin: 0 auto; 
              background-color: #ffffff; 
              border-radius: 8px; 
              overflow: hidden; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
            }
            
            .header { 
              padding: 20px; 
              text-align: center; 
              background-color: #f8f9fa;
              border-bottom: 1px solid #e0e0e0;
            }
            .logo-img { width: 80px; height: auto; }
            
            .body-content { 
              padding: 30px 40px; 
              color: #333333; 
            }
            
            .contract-title { 
              font-size: 24px; 
              font-weight: 700; 
              color: #1a1a1a; 
              margin-bottom: 30px; 
              text-align: center;
              border-bottom: 2px solid #00d09c;
              padding-bottom: 15px;
            }
            
            .section-title { 
              font-size: 18px; 
              font-weight: 600; 
              color: #00d09c; 
              margin: 25px 0 15px 0; 
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            
            .contract-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 15px 0; 
            }
            
            .contract-table td { 
              padding: 8px; 
              border-bottom: 1px solid #e0e0e0; 
              vertical-align: top;
            }
            
            .footer { 
              padding: 20px; 
              text-align: center; 
              font-size: 12px; 
              color: #888888; 
              background-color: #f8f9fa;
              border-top: 1px solid #e0e0e0;
            }
            
            @media only screen and (max-width: 620px) {
              .content-table { width: 100% !important; border-radius: 0; }
              .body-content { padding: 20px 25px !important; }
              .contract-title { font-size: 20px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Montserrat', sans-serif;">
          <center class="email-wrapper">
            <table class="content-table" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td class="header">
                  <img class="logo-img" src="https://gestion.vitalmove.cl/static/media/logoVMDark.bfb629aa47764b494994.png" alt="VitalMove Logo">
                </td>
              </tr>
              <tr>
                <td class="body-content">
                  <h1 class="contract-title">COPIA DE CONTRATO - VITALMOVE</h1>
                  
                  <h2 class="section-title">INFORMACIÓN PERSONAL</h2>
                  <table class="contract-table">
                    ${renderField('Nombre', user.nombre)}
                    ${renderField('Apellido', user.apellido)}
                    ${renderField('Email', user.email)}
                    ${renderField('RUT', user.rut)}
                    ${renderField('Tipo RUT', user.tipoRut)}
                    ${renderField('Teléfono', user.telefono)}
                    ${renderField('Rol', user.rol)}
                    ${renderField('Estado', user.status, 'boolean')}
                    ${renderField('Fecha de Registro', user.fechaRegistro, 'date')}
                  </table>

                  <h2 class="section-title">INFORMACIÓN DE DIRECCIÓN</h2>
                  <table class="contract-table">
                    ${renderField('Dirección', user.direccion)}
                    ${renderField('Número de Dirección', user.numeroDireccion)}
                    ${renderField('Comuna', user.comuna)}
                    ${renderField('Residente Santiago', user.residenteStgo, 'boolean')}
                  </table>

                  <h2 class="section-title">INFORMACIÓN PERSONAL ADICIONAL</h2>
                  <table class="contract-table">
                    ${renderField('Fecha de Nacimiento', user.fechaNacimiento, 'date')}
                    ${renderField('Sexo', user.sexo)}
                  </table>

                  <h2 class="section-title">INFORMACIÓN MÉDICA Y DE SALUD</h2>
                  <table class="contract-table">
                    ${renderField('Padece Patología', user.padecePatologia, 'boolean')}
                    ${renderField('Descripción Patología', user.descripcionPatologia)}
                    ${renderField('Última Actividad Física', user.ultimaActividadFisica)}
                    ${renderField('Condición Neurodivergente', user.neurodivergente, 'boolean')}
                    ${renderField('Descripción Neurodivergente', user.descripcionNeurodivergente)}
                    ${renderField('Objetivo de Ingreso', user.objetivoIngreso)}
                    ${renderField('Toma Medicamentos', user.medicamentos, 'boolean')}
                    ${renderField('Descripción Medicamentos', user.descripcionMedicamentos)}
                    ${renderField('Tiene Alergias', user.alergias, 'boolean')}
                    ${renderField('Descripción Alergias', user.descripcionAlergias)}
                    ${renderField('Ha Tenido Cirugías', user.cirugias, 'boolean')}
                    ${renderField('Descripción Cirugías', user.descripcionCirugias)}
                    ${renderField('Previsión', user.prevision)}
                    ${renderField('Descripción Previsión', user.descripcionPrevision)}
                    ${renderField('Convenio de Emergencia', user.convenioEmergencia, 'boolean')}
                    ${renderField('Descripción Convenio Emergencia', user.descripcionConvenioEmergencia)}
                  </table>

                  <h2 class="section-title">CONTACTO DE EMERGENCIA</h2>
                  <table class="contract-table">
                    ${user.contactoEmergencia ? `
                      ${renderField('Nombres Contacto', user.contactoEmergencia.nombres)}
                      ${renderField('Apellidos Contacto', user.contactoEmergencia.apellidos)}
                      ${renderField('Parentesco', user.contactoEmergencia.parentesco)}
                      ${renderField('Teléfono Contacto', user.contactoEmergencia.telefono)}
                    ` : ''}
                  </table>

                  <h2 class="section-title">INFORMACIÓN PARA MENORES DE EDAD - APODERADO</h2>
                  <table class="contract-table">
                    ${renderField('Es Responsable de Menor', user.responsableMenorEdad, 'boolean')}
                    ${renderField('Nombre Responsable', user.responsableMenorEdadNombre)}
                    ${renderField('Apellido Responsable', user.responsableMenorEdadApellido)}
                    ${renderField('RUT Responsable', user.responsableMenorEdadRut)}
                    ${renderField('Parentesco Responsable', user.responsableMenorEdadParentesco)}
                    ${renderField('Teléfono Responsable', user.responsableMenorEdadTelefono)}
                    ${renderField('Dirección Responsable', user.responsableMenorEdadDireccion)}
                    ${renderField('Número Dirección Responsable', user.responsableMenorEdadNumeroDireccion)}
                    ${renderField('Comuna Responsable', user.responsableMenorEdadComuna)}
                  </table>

                  <h2 class="section-title">INFORMACIÓN DE PLANES Y SERVICIOS</h2>
                  <table class="contract-table">
                    ${renderField('Tipo de Plan', user.tipoPlan)}
                    ${renderField('Tipo de Plan Gimnasio', user.tipoPlanGym)}
                    ${renderField('Bloque Horario', user.bloqueHorario)}
                  </table>

                  <h2 class="section-title">INFORMACIÓN EVALUACIÓN</h2>
                  <table class="contract-table">
                    ${renderField('Evaluado', user.evaluacionInicial, 'boolean')}
                    ${renderField('Tipo de Curso', user.tipoCurso)}
                    ${renderField('Fecha de Evaluación', user.fechaEvaluacion, 'date')}
                    ${renderField('Nivel de Curso', user.nivelCurso)}
                  </table>

                  <h2 class="section-title">BENEFICIO TRABAJADOR - FAMILIAR</h2>
                  <table class="contract-table">
                    ${renderField('Beneficio Trabajador', user.beneficioTrabajador, 'boolean')}
                    ${renderField('Nombre Trabajador', user.nombreTrabajador)}
                    ${renderField('Tipo de Contratación', user.tipoContratacion)}
                  </table>

                  <h2 class="section-title">DOCUMENTOS Y AUTORIZACIONES</h2>
                  <table class="contract-table">
                    ${renderField('Foto Cédula Frontal', user.fotoCedulaFrontal ? 'Adjunta' : '')}
                    ${renderField('Foto Cédula Reverso', user.fotoCedulaReverso ? 'Adjunta' : '')}
                    ${renderField('Firma Electrónica', user.firma ? 'Adjunta' : '')}
                    ${renderField('Declaración de Salud', user.declaracionSalud, 'boolean')}
                    ${renderField('Aceptación Reglamento', user.aceptacionReglamento, 'boolean')}
                    ${renderField('Autorización Tratamiento de Datos', user.autorizacionDatos, 'boolean')}
                  </table>


                </td>
              </tr>
              <tr>
                <td class="footer">
                  <p style="margin: 0; padding: 10px;">Este es un documento oficial de VitalMove</p>
                  <p style="margin: 0;">© 2025 VitalMove. Todos los derechos reservados.</p>
                  <p style="margin: 10px 0 0 0;">Visítanos en <a href="https://vitalmoveglobal.com" style="color: #00d09c; text-decoration: none;">www.vitalmoveglobal.com</a></p>
                </td>
              </tr>
            </table>
          </center>
        </body>
        </html>
      `,
    };

    await smtpTransport.sendMail(mailOptionsTemplate);
    console.log("Email de contrato ha sido enviado con éxito: Receive ok");
  } catch (error) {
    console.error("Error al intentar enviar el email:", error.message);
    // throw new Error("Error sending email");
  }
};

module.exports = sendMailUserContract;
