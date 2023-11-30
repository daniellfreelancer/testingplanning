const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const { GOOGLE_USER, GOOGLE_ID, GOOGLE_SECRET, GOOGLE_REFRESH, GOOGLE_URL, GOOGLE_ACCESS } = process.env


const sendResetMail = async (email, code) => {

    try {
        const oauth2Client = new OAuth2(
            GOOGLE_ID,
            GOOGLE_SECRET,
            GOOGLE_URL
        )
        
        oauth2Client.setCredentials({
            refresh_token: GOOGLE_REFRESH
        })
        
        const accessToken = await oauth2Client.getAccessToken()
        
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
        const mailOptions = {
            from: GOOGLE_USER,
            to: email,
            subject: 'Restablece tu contraseña',
            html: `
            <p style="text-align: center;"><strong><br />Hola Vitalmover.</strong></p>
            <p style="text-align: center;">Haz click en el siguiente link para resetear tu contraseña.  <br/> <br/>  <a style="background: #04BF9D; color: #ffffff; padding: 10px 50px; border-radius: 3px; text-align: center; target="_blank" " href="https://gestion.vitalmove.cl/auth/reset-password/${code}/${email}">Restablecer</a></p>
        `
        }

        const mailOptionsTemplate = {
            from: GOOGLE_USER,
            to: email,
            subject: 'Restablece tu contraseña',
            html: `        
                <body class="forceBgColor" style="background-color: transparent; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: transparent;">
                        <tbody>
                          
                            <tr>
                                <td>
                                <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000; width: 600px; margin: 0 auto;" width="600">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                            <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                        <div class="alignment" align="center" style="line-height:10px"><img class="fullWidth" src="https://1471fdde5b.imgdist.com/public/users/Integrators/BeeProAgency/1100593_1086019/vm-icon.jpeg" style="display: block; height: auto; border: 0; max-width: 360px; width: 100%;" width="360"></div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                                </td>
                            </tr>
        
                           
                            <tr>
                                <td>
                                <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000; width: 600px; margin: 0 auto;" width="600">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-top: 40px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                            <table class="heading_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <h3 style="margin: 0; color: #000000; direction: ltr; font-family: Arial, Helvetica, sans-serif; font-size: 24px; font-weight: 400; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; "><span class="tinyMce-placeholder">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Hola!! VitalMover </span></h3>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="divider_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div class="alignment" align="center">
                                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="55%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 2px solid #C3C3C3;"><span>&#8202;</span></td>
                                                                                </tr>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="divider_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div class="alignment" align="center">
                                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="40%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 2px solid #C3C3C3;"><span>&#8202;</span></td>
                                                                                </tr>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="paragraph_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div style="color:#101112;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:700;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                            <p style="margin: 0;">Muchas gracias por contactar con el soporte de VitalMove, para restablecer&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; tu contraseña ingresa al siguiente link <a style="background: #04BF9D; color: #ffffff; padding: 10px 50px; border-radius: 3px; text-align: center; target="_blank" " href="https://gestion.vitalmove.cl/auth/reset-password/${code}/${email}">Restablecer mi contraseña</a></p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="image_block block-5" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                        <div class="alignment" align="center" style="line-height:10px"><img src="https://1471fdde5b.imgdist.com/public/users/Integrators/BeeProAgency/1100593_1086019/logoVMLight.png" style="display: block; height: auto; border: 0; max-width: 120px; width: 100%;" width="120"></div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="paragraph_block block-6" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div style="color:#101112;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                            <p style="margin: 0;">Para mas información puedes visitar nuestra pagina https://www.vitalmove.cl/ o en nuestras redes sociales:</p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="social_block block-7" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad" style="text-align:center;padding-right:0px;padding-left:0px;">
                                                                        <div class="alignment" align="center">
                                                                            <table class="social-table" width="72px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
                                                                                <tr>
                                                                                    <td style="padding:0 2px 0 2px;"><a href="https://www.facebook.com/VitalMove.Oficial/?locale=es_LA" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" height="32" alt="Facebook" title="facebook" style="display: block; height: auto; border: 0;"></a></td>
                                                                                    <td style="padding:0 2px 0 2px;"><a href="https://www.instagram.com/vitalmove.oficial/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" height="32" alt="Instagram" title="instagram" style="display: block; height: auto; border: 0;"></a></td>
                                                                                </tr>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                                </td>
                            </tr>
        
                            
                            <tr>
                                <td>
                                <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000; width: 600px; margin: 0 auto;" width="600">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                            <table class="empty_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div></div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </body>
            `
        };
        

        await smtpTransport.sendMail(mailOptionsTemplate);
        console.log("Email has been Sent: Receive ok");
        
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error("Error sending email");
      }

}


module.exports = sendResetMail