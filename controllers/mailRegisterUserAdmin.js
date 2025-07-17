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

const sendResetMail = async (email, password, name) => {
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

//     const mailOptionsTemplate = {
//       from: GOOGLE_USER,
//       to: email,
//       subject: "Bienvenido, ya tienes disponible tu cuenta en VitalMove",
//       html: `<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
// <head>
// <title></title>
// <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
// <meta content="width=device-width, initial-scale=1.0" name="viewport"/><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
// <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900" rel="stylesheet" type="text/css"/><!--<![endif]-->
// <style>
// 		* {
// 			box-sizing: border-box;
// 		}

// 		body {
// 			margin: 0;
// 			padding: 0;
// 		}

// 		a[x-apple-data-detectors] {
// 			color: inherit !important;
// 			text-decoration: inherit !important;
// 		}

// 		#MessageViewBody a {
// 			color: inherit;
// 			text-decoration: none;
// 		}

// 		p {
// 			line-height: inherit
// 		}

// 		.desktop_hide,
// 		.desktop_hide table {
// 			mso-hide: all;
// 			display: none;
// 			max-height: 0px;
// 			overflow: hidden;
// 		}

// 		.image_block img+div {
// 			display: none;
// 		}

// 		sup,
// 		sub {
// 			font-size: 75%;
// 			line-height: 0;
// 		}

// 		@media (max-width:740px) {
// 			.desktop_hide table.icons-inner {
// 				display: inline-block !important;
// 			}

// 			.icons-inner {
// 				text-align: center;
// 			}

// 			.icons-inner td {
// 				margin: 0 auto;
// 			}

// 			.mobile_hide {
// 				display: none;
// 			}

// 			.row-content {
// 				width: 100% !important;
// 			}

// 			.stack .column {
// 				width: 100%;
// 				display: block;
// 			}

// 			.mobile_hide {
// 				min-height: 0;
// 				max-height: 0;
// 				max-width: 0;
// 				overflow: hidden;
// 				font-size: 0px;
// 			}

// 			.desktop_hide,
// 			.desktop_hide table {
// 				display: table !important;
// 				max-height: none !important;
// 			}
// 		}
// 	</style><!--[if mso ]><style>sup, sub { font-size: 100% !important; } sup { mso-text-raise:10% } sub { mso-text-raise:-10% }</style> <![endif]-->
// </head>
// <body class="body" style="margin: 0; background-color: #ffffff; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
// <table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;" width="100%">
// <tbody>
// <tr>
// <td>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// <tbody>
// <tr>
// <td>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 720px; margin: 0 auto;" width="720">
// <tbody>
// <tr>
// <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
// <div class="spacer_block block-1" style="height:25px;line-height:25px;font-size:1px;"> </div>
// </td>
// </tr>
// </tbody>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// <tbody>
// <tr>
// <td>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 720px; margin: 0 auto;" width="720">
// <tbody>
// <tr>
// <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
// <table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// <tr>
// <td class="pad" style="padding-left:25px;padding-top:10px;width:100%;padding-right:0px;">
// <div align="center" class="alignment" style="line-height:10px">
// <div style="max-width: 144px;"><img alt="Alternate text" height="auto" src="https://i.ibb.co/346mHff/logo-VMDark.png" style="display: block; height: auto; border: 0; width: 100%;" title="Alternate text" width="144"/></div>
// </div>
// </td>
// </tr>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;" width="100%">
// <tbody>
// <tr>
// <td>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; background-position: top center; color: #000000; width: 720px; margin: 0 auto;" width="720">
// <tbody>
// <tr>
// <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="50%">
// <div class="spacer_block block-1" style="height:30px;line-height:30px;font-size:1px;"> </div>
// <table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
// <tr>
// <td class="pad" style="padding-bottom:10px;padding-left:25px;padding-right:25px;padding-top:10px;">
// <div style="color:#1f0b0b;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:38px;line-height:120%;text-align:left;mso-line-height-alt:45.6px;">
// <p style="margin: 0; word-break: break-word;"><strong style="font-family: inherit; background-color: transparent;">Bienvenido.</strong></p>
// </div>
// </td>
// </tr>
// </table>
// <table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
// <tr>
// <td class="pad" style="padding-bottom:25px;padding-left:25px;padding-right:25px;padding-top:10px;">
// <div style="color:#393d47;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:14px;line-height:180%;text-align:left;mso-line-height-alt:25.2px;">
// <p style="margin: 0; word-break: break-word;">Hola ${name} , VitalMove te da la bienvenida.</p>
// <p style="margin: 0; word-break: break-word;"> </p>
// <p style="margin: 0; word-break: break-word;">Tu contraseña actual es ${password}. y<br/>puedes actualizar tu contraseña desde tu perfil.</p>
// </div>
// </td>
// </tr>
// </table>
// <table border="0" cellpadding="0" cellspacing="0" class="button_block block-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// <tr>
// <td class="pad" style="padding-bottom:10px;padding-left:20px;padding-right:10px;padding-top:10px;text-align:left;">
// <div align="left" class="alignment"><!--[if mso]>
// <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"   style="height:52px;width:220px;v-text-anchor:middle;" arcsize="8%" fillcolor="#00d09c">
// <v:stroke dashstyle="Solid" weight="0px" color="#8a3b8f"/>
// <w:anchorlock/>
// <v:textbox inset="5px,0px,0px,0px">
// <center dir="false" style="color:#ffffff;font-family:sans-serif;font-size:16px">
// <![endif]-->
// <div style="background-color:#00d09c;border-bottom:0px solid #8a3b8f;border-left:0px solid #8a3b8f;border-radius:4px;border-right:0px solid #8a3b8f;border-top:0px solid #8a3b8f;color:#ffffff;display:inline-block;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:16px;font-weight:undefined;mso-border-alt:none;padding-bottom:10px;padding-top:10px;text-align:center;text-decoration:none;width:auto;word-break:keep-all;"><span style="word-break: break-word; padding-left: 50px; padding-right: 45px; font-size: 16px; display: inline-block; letter-spacing: normal;"><span style="word-break: break-word; line-height: 32px;"><strong><a href="https://gestion.vitalmove.cl/" style=" text-decoration:none; color:#ffffff; "  target="_blank">ir al dashboard</strong></a></span></span></div><!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
// </div>
// </td>
// </tr>
// </table>
// </td>
// <td class="column column-2" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="50%">
// <table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// <tr>
// <td class="pad" style="padding-right:5px;width:100%;">
// <div align="center" class="alignment" style="line-height:10px">
// <div style="max-width: 355px;"><img alt="Alternate text" height="auto" src="https://i.ibb.co/T06RTxm/first-imag.png" style="display: block; height: auto; border: 0; width: 100%;" title="Alternate text" width="355"/></div>
// </div>
// </td>
// </tr>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #e4faf4;" width="100%">
// <tbody>
// <tr>
// <td>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 720px; margin: 0 auto;" width="720">
// <tbody>
// <tr>
// <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="50%">
// <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;"> </div>
// <table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
// <tr>
// <td class="pad" style="padding-bottom:10px;padding-left:35px;padding-right:35px;padding-top:5px;">
// <div style="color:#34495e;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:20px;line-height:150%;text-align:center;mso-line-height-alt:30px;"> </div>
// </td>
// </tr>
// </table>
// <div class="spacer_block block-3 mobile_hide" style="height:20px;line-height:20px;font-size:1px;"> </div>
// </td>
// <td class="column column-2" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="50%">
// <div class="spacer_block block-1 mobile_hide" style="height:20px;line-height:20px;font-size:1px;"> </div>
// <div class="spacer_block block-2 mobile_hide" style="height:20px;line-height:20px;font-size:1px;"> </div>
// <div class="spacer_block block-3" style="height:20px;line-height:20px;font-size:1px;"> </div>
// </td>
// </tr>
// </tbody>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-5" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;" width="100%">
// <tbody>
// <tr>
// <td>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 720px; margin: 0 auto;" width="720">
// <tbody>
// <tr>
// <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
// <div class="spacer_block block-1" style="height:30px;line-height:30px;font-size:1px;"> </div>
// <div class="spacer_block block-2" style="height:45px;line-height:45px;font-size:1px;"> </div>
// <table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
// <tr>
// <td class="pad" style="padding-bottom:10px;padding-left:35px;padding-right:35px;padding-top:5px;">
// <div style="color:#34495e;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:24px;line-height:150%;text-align:center;mso-line-height-alt:36px;">
// <p style="margin: 0; word-break: break-word;"><strong><span style="word-break: break-word;"><a href="vitalmove.cl" rel="noopener" style="text-decoration: underline; color: #0068A5;" target="_blank"><strong><span style="word-break: break-word;">www.vitalmove.cl</span></strong></a></span></strong></p>
// </div>
// </td>
// </tr>
// </table>
// <table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
// <tr>
// <td class="pad" style="padding-bottom:25px;padding-left:25px;padding-right:25px;padding-top:10px;">
// <div style="color:#393d47;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:14px;line-height:180%;text-align:center;mso-line-height-alt:25.2px;">
// <p style="margin: 0; word-break: break-word;">Bienvenido a tu guía virtual de entrenamiento, nutrición y bienestar. Diseñada para cumplir tus objetivos de forma transversal sin importar edad y lugar.</p>
// </div>
// </td>
// </tr>
// </table>
// <table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-5" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
// <tr>
// <td class="pad" style="padding-bottom:10px;padding-left:35px;padding-right:35px;padding-top:5px;">
// <div style="color:#34495e;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:24px;line-height:150%;text-align:center;mso-line-height-alt:36px;">
// <p style="margin: 0; word-break: break-word;"><strong><span style="word-break: break-word;">Descarga VitalMove en</span></strong></p>
// </div>
// </td>
// </tr>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-6" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// <tbody>
// <tr>
// <td>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 720px; margin: 0 auto;" width="720">
// <tbody>
// <tr>
// <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="25%">
// <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;"> </div>
// </td>
// <td class="column column-2" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="25%">
// <table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// <tr>
// <td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:15px;width:100%;">
// <div align="center" class="alignment" style="line-height:10px">
// <div style="max-width: 160px;"><img alt="Alternate text" height="auto" src="https://i.ibb.co/7QrZysJ/App-Store-Badge-US-Black.png" style="display: block; height: auto; border: 0; width: 100%;" title="Alternate text" width="160"/></div>
// </div>
// </td>
// </tr>
// </table>
// <div class="spacer_block block-2" style="height:20px;line-height:20px;font-size:1px;"> </div>
// </td>
// <td class="column column-3" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="25%">
// <table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// <tr>
// <td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:15px;width:100%;">
// <div align="center" class="alignment" style="line-height:10px">
// <div style="max-width: 160px;"><img alt="Alternate text" height="auto" src="https://i.ibb.co/GTs6G4D/Google-Play-Badge-US.png" style="display: block; height: auto; border: 0; width: 100%;" title="Alternate text" width="160"/></div>
// </div>
// </td>
// </tr>
// </table>
// <div class="spacer_block block-2" style="height:20px;line-height:20px;font-size:1px;"> </div>
// </td>
// <td class="column column-4" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="25%">
// <div class="spacer_block block-1 mobile_hide" style="height:20px;line-height:20px;font-size:1px;"> </div>
// </td>
// </tr>
// </tbody>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-7" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; background-image: url('https://i.ibb.co/0Dpvzg7/Bottom-section.png'); background-position: center top; background-repeat: no-repeat;" width="100%">
// <tbody>
// <tr>
// <td>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 720px; margin: 0 auto;" width="720">
// <tbody>
// <tr>
// <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
// <div class="spacer_block block-1" style="height:55px;line-height:55px;font-size:1px;"> </div>
// <div class="spacer_block block-2" style="height:55px;line-height:55px;font-size:1px;"> </div>
// </td>
// </tr>
// </tbody>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-8" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;" width="100%">
// <tbody>
// <tr>
// <td>
// <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 720px; margin: 0 auto;" width="720">
// <tbody>
// <tr>
// <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
// <table border="0" cellpadding="0" cellspacing="0" class="icons_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; text-align: center; line-height: 0;" width="100%">
// <tr>
// <td class="pad" style="vertical-align: middle; color: #1e0e4b; font-family: 'Inter', sans-serif; font-size: 15px; padding-bottom: 5px; padding-top: 5px; text-align: center;"><!--[if vml]><table align="center" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
// <!--[if !vml]><!-->
// <table cellpadding="0" cellspacing="0" class="icons-inner" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; padding-left: 0px; padding-right: 0px;"><!--<![endif]-->
// <tr>
// <td style="vertical-align: middle; text-align: center; padding-top: 5px; padding-bottom: 5px; padding-left: 5px; padding-right: 6px;"><a href="http://designedwithbeefree.com/" style="text-decoration: none;" target="_blank"><img align="center" alt="Beefree Logo" class="icon" height="auto" src="https://i.ibb.co/NrzMjb3/Beefree-logo.png" style="display: block; height: auto; margin: 0 auto; border: 0;" width="34"/></a></td>
// <td style="font-family: 'Inter', sans-serif; font-size: 15px; font-weight: undefined; color: #1e0e4b; vertical-align: middle; letter-spacing: undefined; text-align: center; line-height: normal;"><a style="color: #1e0e4b; text-decoration: none;" target="_blank">Designed by VitalMove</a></td>
// </tr>
// </table>
// </td>
// </tr>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// </td>
// </tr>
// </tbody>
// </table>
// </body>
// </html>`,
//     };

    const mailOptionsTemplate = {
      from: GOOGLE_USER,
      to: email,
      subject: "Bienvenido, ya tienes disponible tu cuenta en VitalMove",
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
                  <p class="greeting-text">Nos alegra tenerte a bordo. VitalMove será tu guía virtual para alcanzar tus objetivos de entrenamiento, nutrición y bienestar.</p>
                  <p class="password-info">Tu contraseña actual es: <strong class="highlight-password">${password}</strong></p>
                  <p class="password-info">Te recomendamos cambiarla una vez que inicies sesión por primera vez desde tu perfil.</p>

                  <div class="button-wrapper">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://gestion.vitalmove.cl/" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="#00d09c" fillcolor="#00d09c">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Montserrat,sans-serif;font-size:16px;font-weight:600;">IR AL DASHBOARD</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="https://gestion.vitalmove.cl/" class="button" target="_blank">
                      IR AL DASHBOARD
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

    await smtpTransport.sendMail(mailOptionsTemplate);
    console.log("Email de bienvenida a sido enviado con exito: Receive ok");
  } catch (error) {
    console.error("Error al intentar enviar el email:", error.message);
    // throw new Error("Error sending email");
  }
};

module.exports = sendResetMail;
