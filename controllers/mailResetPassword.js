const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const { GOOGLE_USER, GOOGLE_ID, GOOGLE_SECRET, GOOGLE_REFRESH, GOOGLE_URL } = process.env


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
                accessToken: accessToken
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

        await smtpTransport.sendMail(mailOptions);
        console.log("Email has been Sent: Receive ok");
        
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error("Error sending email");
      }

}


module.exports = sendResetMail