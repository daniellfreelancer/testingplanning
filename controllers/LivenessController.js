const crypto = require('crypto');
const {
  RekognitionClient,
  CreateFaceLivenessSessionCommand,
  GetFaceLivenessSessionResultsCommand
} = require('@aws-sdk/client-rekognition');

// Configuración robusta del cliente AWS
const createRekognitionClient = () => {
  return new RekognitionClient({
    region: process.env.AWS_BUCKET_REGION_REKO,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_MATI,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_MATI,
    },
    maxAttempts: 3, // Reintentos automáticos
    requestTimeout: 5000, // Timeout de 5 segundos
  });
};

const livenessController = {
  iniciarSesion: async (req, res) => {
    let rekognitionClient;
    try {
      rekognitionClient = createRekognitionClient();
      const clientRequestToken = crypto.randomUUID();

      const command = new CreateFaceLivenessSessionCommand({
        ClientRequestToken: clientRequestToken,
        // Configuración mínima sin S3
      });

      const response = await rekognitionClient.send(command);

      if (!response?.SessionId) {
        throw new Error('AWS no devolvió un ID de sesión válido');
      }

      return res.status(200).json({
        message: 'Sesión de verificación iniciada',
        sessionInformation: {
          sessionId: response.SessionId,
          clientRequestToken,
          region: process.env.AWS_BUCKET_REGION_REKO,
          expiresAt: new Date(Date.now() + 600000).toISOString() // 10 minutos
        },
        success: true
      });

    } catch (error) {
      console.error('Error en iniciarSesion:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      // Cierra la conexión del cliente si existe
      if (rekognitionClient) {
        rekognitionClient.destroy();
      }

      return res.status(500).json({
        message: 'Error temporal en el servidor de verificación',
        success: false,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: 'SERVER_ERROR',
        retryable: true // Indica que se puede reintentar
      });
    }
  },

  obtenerResultado: async (req, res) => {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({
        message: 'Se requiere el ID de sesión',
        success: false,
        code: 'MISSING_SESSION_ID'
      });
    }

    let rekognitionClient;
    try {
      rekognitionClient = createRekognitionClient();
      const command = new GetFaceLivenessSessionResultsCommand({ 
        SessionId: sessionId 
      });

      const result = await rekognitionClient.send(command);
      const outcome = result.LivenessOutcome || 'UNKNOWN';

      return res.status(200).json({
        message: 'Resultado de verificación',
        isLive: outcome === 'LIVENESS_CONFIRMED',
        confidence: result.Confidence || 0,
        outcome,
        success: true
      });

    } catch (error) {
      console.error('Error en obtenerResultado:', {
        sessionId,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      if (rekognitionClient) {
        rekognitionClient.destroy();
      }

      let statusCode = 500;
      let errorMessage = 'Error al verificar el resultado';
      let code = 'VERIFICATION_ERROR';

      if (error.name === 'ResourceNotFoundException') {
        statusCode = 404;
        errorMessage = 'La sesión ha expirado o no existe';
        code = 'SESSION_EXPIRED';
      }

      return res.status(statusCode).json({
        message: errorMessage,
        success: false,
        code,
        retryable: statusCode !== 404
      });
    }
  }
};

module.exports = livenessController;