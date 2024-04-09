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

        const mailOptionsTemplate = {
            from: GOOGLE_USER,
            to: email,
            subject: 'Solicitud cambio de contraseña',
            html: `<html
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            lang="es"
          >
            <head>
              <title>VitalMove</title>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link
                href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;200;300;400;500;600;700;800;900"
                rel="stylesheet"
                type="text/css"
              />
              <!--<![endif]-->
              <style>
                * {
                  box-sizing: border-box;
                }
          
                body {
                  margin: 0;
                  padding: 0;
                }
          
                a[x-apple-data-detectors] {
                  color: inherit !important;
                  text-decoration: inherit !important;
                }
          
                #MessageViewBody a {
                  color: inherit;
                  text-decoration: none;
                }
          
                p {
                  line-height: inherit;
                }
          
                .desktop_hide,
                .desktop_hide table {
                  mso-hide: all;
                  display: none;
                  max-height: 0px;
                  overflow: hidden;
                }
          
                .image_block img + div {
                  display: none;
                }
          
                @media (max-width: 650px) {
                  .desktop_hide table.icons-inner,
                  .row-4 .column-3 .block-1.social_block .alignment table,
                  .social_block.desktop_hide .social-table {
                    display: inline-block !important;
                  }
          
                  .icons-inner {
                    text-align: center;
                  }
          
                  .icons-inner td {
                    margin: 0 auto;
                  }
          
                  .mobile_hide {
                    display: none;
                  }
          
                  .row-content {
                    width: 100% !important;
                  }
          
                  .stack .column {
                    width: 100%;
                    display: block;
                  }
          
                  .mobile_hide {
                    min-height: 0;
                    max-height: 0;
                    max-width: 0;
                    overflow: hidden;
                    font-size: 0px;
                  }
          
                  .desktop_hide,
                  .desktop_hide table {
                    display: table !important;
                    max-height: none !important;
                  }
          
                  .row-2 .column-2 .block-1.image_block td.pad,
                  .row-4 .column-1 .block-2.paragraph_block td.pad {
                    padding: 10px !important;
                  }
          
                  .row-4 .column-1 .block-1.heading_block h1,
                  .row-4 .column-1 .block-2.paragraph_block td.pad > div,
                  .row-4 .column-2 .block-1.heading_block h1,
                  .row-4 .column-2 .block-2.paragraph_block td.pad > div,
                  .row-4 .column-3 .block-1.social_block .alignment {
                    text-align: center !important;
                  }
          
                  .row-4 .column-1 .block-1.heading_block td.pad,
                  .row-4 .column-2 .block-1.heading_block td.pad {
                    padding: 0 10px !important;
                  }
                }
              </style>
            </head>
          
            <body
              class="forceBgColor"
              style="
                background-color: transparent;
                margin: 0;
                padding: 0;
                -webkit-text-size-adjust: none;
                text-size-adjust: none;
              "
            >
              <table
                class="nl-container"
                width="100%"
                border="0"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                  background-color: transparent;
                  background-image: url('https://1471fdde5b.imgdist.com/pub/bfra/fcpd89o8/oyz/abw/z3b/homeb.png');
                  background-position: top left;
                  background-size: cover;
                  background-repeat: no-repeat;
                "
              >
                <tbody>
                  <tr>
                    <td>
                      <table
                        class="row row-1"
                        align="center"
                        width="100%"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          background-size: auto;
                        "
                      >
                        <tbody>
                          <tr>
                            <td>
                              <table
                                class="row-content stack"
                                align="center"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  background-size: auto;
                                  color: #000000;
                                  width: 630px;
                                  margin: 0 auto;
                                "
                                width="630"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="column column-1"
                                      width="100%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        font-weight: 400;
                                        text-align: left;
                                        padding-top: 5px;
                                        vertical-align: top;
                                        border-top: 0px;
                                        border-right: 0px;
                                        border-bottom: 0px;
                                        border-left: 0px;
                                      "
                                    >
                                      <table
                                        class="image_block block-1"
                                        width="100%"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                        "
                                      >
                                        <tr>
                                          <td class="pad" style="width: 100%">
                                            <div
                                              class="alignment"
                                              align="center"
                                              style="line-height: 10px"
                                            >
                                              <div style="max-width: 630px">
                                                <img
                                                  src="https://1471fdde5b.imgdist.com/pub/bfra/fcpd89o8/zyp/2ys/qpg/logo-home.png"
                                                  style="
                                                    display: block;
                                                    height: auto;
                                                    border: 0;
                                                    width: 100%;
                                                  "
                                                  width="630"
                                                  alt="Ramadana"
                                                  title="Ramadana"
                                                  height="auto"
                                                />
                                              </div>
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
          
                      <table
                        class="row row-2"
                        align="center"
                        width="100%"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          background-size: auto;
                        "
                      >
                        <tbody>
                          <tr>
                            <td>
                              <table
                                class="row-content stack"
                                align="center"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  background-size: auto;
                                  border-radius: 0;
                                  color: #000000;
                                  width: 630px;
                                  margin: 0 auto;
                                "
                                width="630"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="column column-1"
                                      width="50%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        font-weight: 400;
                                        text-align: left;
                                        padding-bottom: 5px;
                                        padding-top: 5px;
                                        vertical-align: middle;
                                        border-top: 0px;
                                        border-right: 0px;
                                        border-bottom: 0px;
                                        border-left: 0px;
                                      "
                                    >
                                      <table
                                        class="heading_block block-1"
                                        width="100%"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                        "
                                      >
                                        <tr>
                                          <td
                                            class="pad"
                                            style="
                                              padding-left: 10px;
                                              padding-right: 10px;
                                              padding-top: 10px;
                                              text-align: center;
                                              width: 100%;
                                            "
                                          >
                                            <h2
                                              style="
                                                margin: 0;
                                                color: #ffffff;
                                                direction: ltr;
                                                font-family: 'Fira Sans',
                                                  'Lucida Sans Unicode', 'Lucida Grande',
                                                  sans-serif;
                                                font-size: 27px;
                                                font-weight: 700;
                                                letter-spacing: normal;
                                                line-height: 150%;
                                                text-align: left;
                                                margin-top: 0;
                                                margin-bottom: 0;
                                                mso-line-height-alt: 40.5px;
                                              "
                                            >
                                              <span class="tinyMce-placeholder"
                                                >Muchas gracias por contactar con el
                                                soporte de VitalMove, para
                                                restablecer&nbsp; tu contraseña ingresa al
                                                siguiente
                                                <a
                                                  href="https://gestion.vitalmove.cl/auth/reset-password/$%7Bcode%7D/$%7Bemail%7D"
                                                  target="_blank"
                                                  title="Restablecer contraseña"
                                                  style="
                                                    text-decoration: underline;
                                                    color: #8a3c90;
                                                  "
                                                  rel="noopener"
                                                  >LINK</a
                                                ></span
                                              >
                                            </h2>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td
                                      class="column column-2"
                                      width="50%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        font-weight: 400;
                                        text-align: left;
                                        padding-bottom: 5px;
                                        padding-top: 5px;
                                        vertical-align: middle;
                                        border-top: 0px;
                                        border-right: 0px;
                                        border-bottom: 0px;
                                        border-left: 0px;
                                      "
                                    >
                                      <table
                                        class="image_block block-1"
                                        width="100%"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                        "
                                      >
                                        <tr>
                                          <td
                                            class="pad"
                                            style="
                                              width: 100%;
                                              padding-right: 0px;
                                              padding-left: 0px;
                                            "
                                          >
                                            <div
                                              class="alignment"
                                              align="center"
                                              style="line-height: 10px"
                                            >
                                              <div style="max-width: 220.5px">
                                                <img
                                                  src="https://1471fdde5b.imgdist.com/pub/bfra/fcpd89o8/fc9/yhn/eca/logoVMLight_1.png"
                                                  style="
                                                    display: block;
                                                    height: auto;
                                                    border: 0;
                                                    width: 100%;
                                                  "
                                                  width="220.5"
                                                  alt="family praying"
                                                  title="family praying"
                                                  height="auto"
                                                />
                                              </div>
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
                      <table
                        class="row row-3"
                        align="center"
                        width="100%"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
                      >
                        <tbody>
                          <tr>
                            <td>
                              <table
                                class="row-content stack"
                                align="center"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-radius: 0;
                                  color: #000000;
                                  width: 630px;
                                  margin: 0 auto;
                                "
                                width="630"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="column column-1"
                                      width="50%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        font-weight: 400;
                                        text-align: left;
                                        padding-bottom: 5px;
                                        padding-top: 5px;
                                        vertical-align: middle;
                                        border-top: 0px;
                                        border-right: 0px;
                                        border-bottom: 0px;
                                        border-left: 0px;
                                      "
                                    >
                                      <table
                                        class="image_block block-1"
                                        width="100%"
                                        border="0"
                                        cellpadding="10"
                                        cellspacing="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                        "
                                      >
                                        <tr>
                                          <td class="pad">
                                            <div
                                              class="alignment"
                                              align="center"
                                              style="line-height: 10px"
                                            >
                                              <div style="max-width: 283.5px">
                                                <img
                                                  src="https://1471fdde5b.imgdist.com/pub/bfra/fcpd89o8/fne/82v/970/pexels-cottonbro-studio-4753990.jpg"
                                                  style="
                                                    display: block;
                                                    height: auto;
                                                    border: 0;
                                                    width: 100%;
                                                  "
                                                  width="283.5"
                                                  alt="Iftar dinner"
                                                  title="Iftar dinner"
                                                  height="auto"
                                                />
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td
                                      class="column column-2"
                                      width="50%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        font-weight: 400;
                                        text-align: left;
                                        padding-bottom: 5px;
                                        padding-top: 5px;
                                        vertical-align: middle;
                                        border-top: 0px;
                                        border-right: 0px;
                                        border-bottom: 0px;
                                        border-left: 0px;
                                      "
                                    >
                                      <table
                                        class="heading_block block-1"
                                        width="100%"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                        "
                                      >
                                        <tr>
                                          <td
                                            class="pad"
                                            style="
                                              padding-left: 10px;
                                              padding-right: 10px;
                                              padding-top: 10px;
                                              text-align: center;
                                              width: 100%;
                                            "
                                          >
                                            <h2
                                              style="
                                                margin: 0;
                                                color: #ffffff;
                                                direction: ltr;
                                                font-family: 'Fira Sans',
                                                  'Lucida Sans Unicode', 'Lucida Grande',
                                                  sans-serif;
                                                font-size: 27px;
                                                font-weight: 700;
                                                letter-spacing: normal;
                                                line-height: 150%;
                                                text-align: left;
                                                margin-top: 0;
                                                margin-bottom: 0;
                                                mso-line-height-alt: 40.5px;
                                              "
                                            >
                                              Motívate a seguir entrenando con
                                              Vitalmove...
                                            </h2>
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
                      <table
                        class="row row-4"
                        align="center"
                        width="100%"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt"
                      >
                        <tbody>
                          <tr>
                            <td>
                              <table
                                class="row-content stack"
                                align="center"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  color: #000000;
                                  width: 630px;
                                  margin: 0 auto;
                                "
                                width="630"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="column column-1"
                                      width="33.333333333333336%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        font-weight: 400;
                                        text-align: left;
                                        padding-bottom: 5px;
                                        padding-top: 5px;
                                        vertical-align: top;
                                        border-top: 0px;
                                        border-right: 0px;
                                        border-bottom: 0px;
                                        border-left: 0px;
                                      "
                                    >
                                      <table
                                        class="heading_block block-1"
                                        width="100%"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                        "
                                      >
                                        <tr>
                                          <td
                                            class="pad"
                                            style="
                                              padding-left: 20px;
                                              text-align: center;
                                              width: 100%;
                                            "
                                          >
                                            <h1
                                              style="
                                                margin: 0;
                                                color: #ffffff;
                                                direction: ltr;
                                                font-family: Arial, Helvetica, sans-serif;
                                                font-size: 18px;
                                                font-weight: 700;
                                                line-height: 200%;
                                                text-align: left;
                                                margin-top: 0;
                                                margin-bottom: 0;
                                                mso-line-height-alt: 36px;
                                              "
                                            >
                                              <span class="tinyMce-placeholder"
                                                >Nosotros</span
                                              >
                                            </h1>
                                          </td>
                                        </tr>
                                      </table>
                                      <table
                                        class="paragraph_block block-2"
                                        width="100%"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                          word-break: break-word;
                                        "
                                      >
                                        <tr>
                                          <td
                                            class="pad"
                                            style="
                                              padding-bottom: 10px;
                                              padding-left: 20px;
                                              padding-right: 20px;
                                              padding-top: 10px;
                                            "
                                          >
                                            <div
                                              style="
                                                color: #ffffff;
                                                direction: ltr;
                                                font-family: Arial, Helvetica, sans-serif;
                                                font-size: 14px;
                                                font-weight: 400;
                                                letter-spacing: 0px;
                                                line-height: 150%;
                                                text-align: left;
                                                mso-line-height-alt: 21px;
                                              "
                                            >
                                              <p style="margin: 0">
                                                Somos una aplicación de acondicionamiento
                                                físico que te hará entrar en el mundo
                                                fitness.&nbsp;
                                              </p>
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td
                                      class="column column-2"
                                      width="33.333333333333336%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        font-weight: 400;
                                        text-align: left;
                                        padding-bottom: 5px;
                                        padding-top: 5px;
                                        vertical-align: top;
                                        border-top: 0px;
                                        border-right: 0px;
                                        border-bottom: 0px;
                                        border-left: 0px;
                                      "
                                    >
                                      <table
                                        class="heading_block block-1"
                                        width="100%"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                        "
                                      >
                                        <tr>
                                          <td
                                            class="pad"
                                            style="
                                              padding-left: 20px;
                                              text-align: center;
                                              width: 100%;
                                            "
                                          >
                                            <h1
                                              style="
                                                margin: 0;
                                                color: #ffffff;
                                                direction: ltr;
                                                font-family: Arial, Helvetica, sans-serif;
                                                font-size: 18px;
                                                font-weight: normal;
                                                line-height: 200%;
                                                text-align: left;
                                                margin-top: 0;
                                                margin-bottom: 0;
                                                mso-line-height-alt: 36px;
                                              "
                                            >
                                              <strong>Contacto</strong>
                                            </h1>
                                          </td>
                                        </tr>
                                      </table>
                                      <table
                                        class="paragraph_block block-2"
                                        width="100%"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                          word-break: break-word;
                                        "
                                      >
                                        <tr>
                                          <td
                                            class="pad"
                                            style="
                                              padding-bottom: 10px;
                                              padding-left: 20px;
                                              padding-right: 20px;
                                              padding-top: 10px;
                                            "
                                          >
                                            <div
                                              style="
                                                color: #ffffff;
                                                direction: ltr;
                                                font-family: Arial, Helvetica, sans-serif;
                                                font-size: 14px;
                                                font-weight: 400;
                                                letter-spacing: 0px;
                                                line-height: 150%;
                                                text-align: left;
                                                mso-line-height-alt: 21px;
                                              "
                                            >
                                              <p style="margin: 0">
                                                <a
                                                  href="https://www.vitalmove.cl/"
                                                  target="_blank"
                                                  style="
                                                    text-decoration: underline;
                                                    color: #ffffff;
                                                  "
                                                  rel="noopener"
                                                  >Vitalmove.cl</a
                                                >
                                              </p>
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td
                                      class="column column-3"
                                      width="33.333333333333336%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        font-weight: 400;
                                        text-align: left;
                                        padding-bottom: 5px;
                                        padding-top: 5px;
                                        vertical-align: top;
                                        border-top: 0px;
                                        border-right: 0px;
                                        border-bottom: 0px;
                                        border-left: 0px;
                                      "
                                    >
                                      <table
                                        class="social_block block-1"
                                        width="100%"
                                        border="0"
                                        cellpadding="10"
                                        cellspacing="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                        "
                                      >
                                        <tr>
                                          <td class="pad">
                                            <div class="alignment" align="left">
                                              <table
                                                class="social-table"
                                                width="72px"
                                                border="0"
                                                cellpadding="0"
                                                cellspacing="0"
                                                role="presentation"
                                                style="
                                                  mso-table-lspace: 0pt;
                                                  mso-table-rspace: 0pt;
                                                  display: inline-block;
                                                "
                                              >
                                                <tr>
                                                  <td style="padding: 0 4px 0 0">
                                                    <a
                                                      href="https://www.facebook.com/VitalMove.Oficial/?locale=es_LA"
                                                      target="_blank"
                                                      ><img
                                                        src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-white/facebook@2x.png"
                                                        width="32"
                                                        height="auto"
                                                        alt="Facebook"
                                                        title="facebook"
                                                        style="
                                                          display: block;
                                                          height: auto;
                                                          border: 0;
                                                        "
                                                    /></a>
                                                  </td>
                                                  <td style="padding: 0 4px 0 0">
                                                    <a
                                                      href="https://www.instagram.com/vitalmove.oficial/"
                                                      target="_blank"
                                                      ><img
                                                        src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-white/instagram@2x.png"
                                                        width="32"
                                                        height="auto"
                                                        alt="Instagram"
                                                        title="instagram"
                                                        style="
                                                          display: block;
                                                          height: auto;
                                                          border: 0;
                                                        "
                                                    /></a>
                                                  </td>
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
                      <table
                        class="row row-5"
                        align="center"
                        width="100%"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          background-color: #ffffff;
                        "
                      >
                        <tbody>
                          <tr>
                            <td>
                              <table
                                class="row-content stack"
                                align="center"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  background-color: #ffffff;
                                  color: #000000;
                                  width: 630px;
                                  margin: 0 auto;
                                "
                                width="630"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="column column-1"
                                      width="100%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        font-weight: 400;
                                        text-align: left;
                                        padding-bottom: 5px;
                                        padding-top: 5px;
                                        vertical-align: top;
                                        border-top: 0px;
                                        border-right: 0px;
                                        border-bottom: 0px;
                                        border-left: 0px;
                                      "
                                    >
                                      <table
                                        class="icons_block block-1"
                                        width="100%"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                          text-align: center;
                                        "
                                      >
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
          </html>`
        };


        await smtpTransport.sendMail(mailOptionsTemplate);
        console.log("Email a sido enviado con exito: Receive ok");

    } catch (error) {
        console.error("Error al intentar enviar el email:", error.message);
        // throw new Error("Error sending email");
    }

}


module.exports = sendResetMail