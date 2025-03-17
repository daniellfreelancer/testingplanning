const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const {
  GOOGLE_USER,
  GOOGLE_ID,
  GOOGLE_SECRET,
  GOOGLE_URL,
  GOOGLE_ACCESS,
  AUTH__CODE_FCM,
  REFRESH_TOKEN_FCM,
} = process.env;
const fs = require("fs");
const path = require("path");

// Configura el cliente OAuth2
const oauth2Client = new OAuth2(
  GOOGLE_ID, // Client ID
  GOOGLE_SECRET, // Client Secret
  GOOGLE_URL // Redirect URL
);

// Configura las credenciales con el refresh token
oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN_FCM, // Refresh token
});

async function getAccessToken() {
  try {
    // Obtén el access token
    const { token } = await oauth2Client.getAccessToken();
    return token;
  } catch (error) {
    console.error("Error obteniendo el access token:", error);
    throw error;
  }
}

const fcmController = {
  sendNotificationFCM: async (req, res) => {
    const { token, title, body, data } = req.body;

    // Ejemplo de uso
    getAccessToken()
      .then((token) => console.log("Access Token:", token))
      .catch((error) => console.error("Error:", error));

    const accessToken = await getAccessToken();
    const url = `https://fcm.googleapis.com/v1/projects/vitalmove-auth/messages:send`;

    const message = {
      message: {
        token: token, // Token FCM del dispositivo del usuario
        notification: {
          title: title,
          body: body,
        },
        data: data, // Datos adicionales (opcional)
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error en la solicitud: ${response.status} - ${JSON.stringify(
            errorData
          )}`
        );
      }

      const responseData = await response.json();
      console.log("Notificación enviada:", responseData);
      res
        .status(200)
        .json({ message: "Notificación enviada", data: responseData });
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
      res
        .status(500)
        .json({
          message: "Error al enviar la notificación",
          error: error.message,
        });
    }
  },
};

module.exports = fcmController;
