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

const sendPatentePiscinaSantiago = async (emailUser, nameUser, vehicleData = {}) => {
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

        const currentDate = new Date().toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const {
            nombre,
            apellido,
            rut,
            correo,
            tipoUsuario,
            institucionNombre,
            diaAsistencia,
            tipoVehiculo,
            marcaVehiculo,
            patente,
            contrato,
        } = vehicleData || {};

        const tipoUsuarioLegible = tipoUsuario === 'individual'
            ? 'Usuario Contrato Individual'
            : (tipoUsuario === 'institucion' ? 'Usuario Institución/Organización' : 'N/A');

        const tipoVehiculoLegible = tipoVehiculo === 'automovil' ? 'AUTOMÓVIL' : 'MOTOCICLETA';

        const mailOptionsTemplate = {
            from: GOOGLE_USER,
            to: emailUser,
            subject: "Autorización de ingreso vehicular - Piscina Olímpica de Santiago",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Autorización de ingreso vehicular</title>
  <style>
    * {
      box-sizing: border-box;
    }
    
    body { 
      margin:0; 
      padding:0; 
      background:#f5f6f7; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"; 
      color:#1f2937; 
      line-height:1.4;
      width:100%;
    }
    
    .wrapper { 
      width:100%; 
      background:#f5f6f7; 
      padding:0; 
      min-height:100vh;
    }
    
    .card { 
      width:100%; 
      margin:0; 
      background:#ffffff; 
      border-radius:0; 
      overflow:hidden; 
      box-shadow:none; 
    }
    
    .header { 
      text-align:center; 
      border-bottom:2px solid #2563eb; 
      padding:16px 12px; 
      background:#ffffff;
    }
    
    .title { 
      font-size:16px; 
      font-weight:700; 
      color:#1f2937; 
      margin:0 0 6px 0; 
      line-height:1.3;
    }
    
    .subtitle { 
      font-size:13px; 
      color:#6b7280; 
      margin:0 0 4px 0; 
      line-height:1.4;
    }
    
    .date { 
      font-size:11px; 
      color:#9ca3af; 
      margin:0; 
    }
    
    .content { 
      padding:12px; 
      display:grid;
      grid-template-columns:1fr;
      gap:16px;
    }
    
    .intro { 
      background:#f3f4f6; 
      color:#374151; 
      padding:12px; 
      border-radius:6px; 
      font-size:13px; 
      line-height:1.6; 
      margin:0 0 4px 0; 
      grid-column:1;
    }
    
    .section-title { 
      font-size:14px; 
      font-weight:700; 
      color:#1f2937; 
      padding-bottom:6px; 
      border-bottom:1px solid #e5e7eb; 
      margin:0 0 12px 0; 
      grid-column:1;
    }
    
    .grid { 
      display:grid;
      grid-template-columns:1fr;
      gap:12px;
      grid-column:1;
      margin-bottom:4px;
    }
    
    .field-group {
      display:grid;
      grid-template-columns:1fr;
      gap:4px;
      margin-bottom:4px;
    }
    
    .label { 
      font-size:11px; 
      font-weight:700; 
      color:#374151; 
      margin:0 0 4px 0; 
      text-transform:uppercase;
      letter-spacing:0.5px;
    }
    
    .value { 
      font-size:12px; 
      color:#111827; 
      background:#f9fafb; 
      border-radius:4px; 
      padding:8px 10px; 
      margin:0 0 4px 0; 
      border:1px solid #e5e7eb;
      word-break:break-word;
    }
    
    .vehicle { 
      background:#fef3c7; 
      border:1px solid #f59e0b; 
      border-radius:6px; 
      padding:12px; 
      margin:0 0 4px 0; 
      grid-column:1;
      display:grid;
      grid-template-columns:1fr;
      gap:8px;
    }
    
    .vehicle-title { 
      font-size:13px; 
      font-weight:700; 
      color:#92400e; 
      text-align:center; 
      margin:0 0 8px 0; 
      grid-column:1;
    }
    
    .warn { 
      background:#fef2f2; 
      border:1px solid #f87171; 
      border-radius:6px; 
      padding:10px; 
      margin:0 0 4px 0; 
      text-align:center; 
      grid-column:1;
    }
    
    .warn-text { 
      font-size:11px; 
      color:#991b1b; 
      font-weight:700; 
      margin:2px 0 4px 0; 
    }
    
    .terms { 
      margin:0 0 4px 0; 
      grid-column:1;
    }
    
    .term { 
      font-size:11px; 
      color:#374151; 
      line-height:1.5; 
      margin:6px 0 4px 0; 
      padding-left:6px;
    }
    
    .responsa { 
      font-size:11px; 
      color:#6b7280; 
      text-align:center; 
      font-style:italic; 
      margin:8px 0 4px 0; 
      grid-column:1;
    }
    
    .footer { 
      text-align:center; 
      border-top:1px solid #e5e7eb; 
      color:#9ca3af; 
      font-size:10px; 
      padding:8px; 
      background:#f9fafb;
      margin-bottom:4px;
    }
    
    .brand { 
      text-align:center; 
      font-size:11px; 
      color:#6b7280; 
      padding:8px 0 12px 0; 
      line-height:1.4;
      grid-column:1;
      margin-bottom:4px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <p class="title">AUTORIZACIÓN DE INGRESO VEHICULAR</p>
        <p class="subtitle">Piscina Olímpica Temperada de Santiago</p>
        <p class="date">Fecha de emisión: ${currentDate}</p>
      </div>
      <div class="content">
        <p class="intro">
          Este registro constituye una autorización de administración para ingreso vehicular (${tipoVehiculo || 'vehículo'}/auto).
          Se requiere un uso responsable en los días de su curso o plan escogido, con un tiempo máximo de dos horas.
        </p>

        <p class="section-title">DATOS PERSONALES DEL USUARIO</p>
        <div class="grid">
          <div class="field-group">
            <p class="label">Nombre</p>
            <p class="value">${nombre || nameUser || 'N/A'}</p>
          </div>

          <div class="field-group">
            <p class="label">Apellido</p>
            <p class="value">${apellido || 'N/A'}</p>
          </div>

          <div class="field-group">
            <p class="label">RUT</p>
            <p class="value">${rut || 'N/A'}</p>
          </div>

          <div class="field-group">
            <p class="label">Correo Electrónico</p>
            <p class="value">${correo || emailUser || 'N/A'}</p>
          </div>

          <div class="field-group">
            <p class="label">Tipo de Usuario</p>
            <p class="value">${tipoUsuarioLegible}</p>
          </div>

          ${institucionNombre ? `
          <div class="field-group">
            <p class="label">Institución</p>
            <p class="value">${institucionNombre}</p>
          </div>` : ''}

          <div class="field-group">
            <p class="label">Día de Asistencia</p>
            <p class="value">${diaAsistencia || 'N/A'}</p>
          </div>

          <div class="field-group">
            <p class="label">Número de contrato</p>
            <p class="value">${contrato || 'N/A'}</p>
          </div>
        </div>

        <div class="vehicle">
          <p class="vehicle-title">DATOS DEL VEHÍCULO AUTORIZADO</p>
          <div class="grid">
            <div class="field-group">
              <p class="label">Tipo de Vehículo</p>
              <p class="value">${tipoVehiculoLegible}</p>
            </div>
            <div class="field-group">
              <p class="label">Marca</p>
              <p class="value">${marcaVehiculo || 'N/A'}</p>
            </div>
            <div class="field-group">
              <p class="label">Patente</p>
              <p class="value">${patente || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div class="warn">
          <p class="warn-text">RESPETE VELOCIDAD MÁXIMA INDICADA EN LA RUTA (20 km/h)</p>
          <p class="warn-text">EVITE MULTAS Y SANCIONES</p>
        </div>

        <div class="terms">
          <p class="section-title">TÉRMINOS Y CONDICIONES</p>
          <p class="term">• Cada mes se renovarán las bases y, una vez renovado contrato en el mes siguiente, debe llenar nuevamente este formulario con su nuevo número de contrato, o el mismo número en caso de renovaciones.</p>
          <p class="term">• Piscina Temperada no cuenta con estacionamiento (Art. 1 Términos y Condiciones del contrato). Parque O'Higgins dispone de un espacio para usuarios del recinto y, en el marco del control de acceso que mantiene Parque, se requiere contar con autorización de patentes.</p>
          <p class="term">• Las administraciones de Piscina Temperada y Parque O'Higgins no se hacen responsables por robos, extravíos o cualquier especie de daño.</p>
          <p class="term">• La presente autorización es válida únicamente para el vehículo especificado y en los días indicados.</p>
          <p class="term">• El uso del estacionamiento está sujeto a disponibilidad y a las normativas del Parque O'Higgins.</p>
        </div>

        <p class="responsa">Al utilizar este servicio, el usuario acepta todos los términos y condiciones establecidos.</p>

        <div class="brand">
          <p style="margin:0;">Piscina Municipal Santiago - Corporación para el Desarrollo de Santiago (CORDESAN)</p>
        </div>
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

        await smtpTransport.sendMail(mailOptionsTemplate);
        console.log("Email de patente enviado con éxito: Receive ok");
        return true;
    } catch (error) {
        console.log("Error al intentar enviar el email:", error.message);
        return false;
    }
}

module.exports = sendPatentePiscinaSantiago;