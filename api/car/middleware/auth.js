const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar token JWT
 */
const verificarToken = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado o formato inválido'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.KEY_JWT);

    // Agregar información del usuario al request
    req.usuarioId = decoded.id;
    req.usuarioRole = decoded.role;

    next();
  } catch (error) {
    console.error('Error al verificar token:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al verificar autenticación',
      error: error.message
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuarioRole) {
      return res.status(401).json({
        success: false,
        message: 'No se pudo determinar el rol del usuario'
      });
    }

    if (!rolesPermitidos.includes(req.usuarioRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

/**
 * Igual que verificarToken pero no responde 401 si falta el token o es inválido/expirado.
 * Útil mientras el cliente no envía JWT o la seguridad aún no está activa.
 */
const verificarTokenOpcional = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.KEY_JWT);
    req.usuarioId = decoded.id;
    req.usuarioRole = decoded.role;
    next();
  } catch (error) {
    console.warn('verificarTokenOpcional: token omitido o no válido, continuando sin usuario:', error.message);
    next();
  }
};

/**
 * Igual que verificarRol pero solo aplica si ya hay req.usuarioRole (token válido previo).
 */
const verificarRolOpcional = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuarioRole) {
      return next();
    }

    if (!rolesPermitidos.includes(req.usuarioRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol,
  verificarTokenOpcional,
  verificarRolOpcional
};
