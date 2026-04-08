const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const SesionTallerEjecutadaPteAlto = require('./sesionTallerEjecutadaPteAlto');
const TalleresDeportivosPteAlto = require('../talleres-deportivos/talleresDeportivosPteAlto');

/**
 * creadoPor: body.creadoPor (ObjectId) o, si hay Bearer válido, decoded.id.
 * Sin token ni creadoPor, crear sesión falla con 400.
 */
function resolverCreadoPorId(req) {
  const fromBody = req.body && req.body.creadoPor;
  if (fromBody && mongoose.Types.ObjectId.isValid(fromBody)) {
    return String(fromBody);
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.KEY_JWT);
      if (decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
        return String(decoded.id);
      }
    } catch {
      // Token ausente o inválido: no bloquear lectura; crear exige creadoPor o token válido
    }
  }
  return null;
}

function conteosDesdeAsistencias(asistencias) {
  const presentes = (asistencias || []).filter((a) => a.presente).length;
  const ausentes = (asistencias || []).length - presentes;
  return { presentes, ausentes };
}

function formatearLista(doc) {
  const { presentes, ausentes } = conteosDesdeAsistencias(doc.asistencias);
  return {
    _id: doc._id,
    tallerId: doc.tallerId,
    creadoPor: doc.creadoPor,
    fechaHoraInicio: doc.fechaHoraInicio,
    fechaHoraFin: doc.fechaHoraFin,
    presentes,
    ausentes,
    geo: doc.geo || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

const crearSesionEjecutada = async (req, res) => {
  try {
    const { tallerId, fechaHoraInicio, fechaHoraFin, asistencias, geo } = req.body;
    const creadoPor = resolverCreadoPorId(req);

    if (!creadoPor) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere creadoPor en el cuerpo o un token Bearer válido',
      });
    }

    if (!tallerId || !fechaHoraInicio || !fechaHoraFin || !Array.isArray(asistencias)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere tallerId, fechaHoraInicio, fechaHoraFin y asistencias',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tallerId)) {
      return res.status(400).json({ success: false, message: 'tallerId inválido' });
    }

    const taller = await TalleresDeportivosPteAlto.findById(tallerId).select('usuarios');
    if (!taller) {
      return res.status(404).json({ success: false, message: 'Taller no encontrado' });
    }

    const idsInscritos = new Set((taller.usuarios || []).map((id) => id.toString()));

    if (idsInscritos.size > 0) {
      if (asistencias.length !== idsInscritos.size) {
        return res.status(400).json({
          success: false,
          message: 'Debe registrar asistencia para cada usuario inscrito activo',
        });
      }
      const seen = new Set();
      for (const a of asistencias) {
        const uid = String(a.usuarioId);
        if (seen.has(uid)) {
          return res.status(400).json({
            success: false,
            message: 'Hay usuarios duplicados en la lista de asistencia',
          });
        }
        seen.add(uid);
      }
    }

    for (const a of asistencias) {
      if (!a.usuarioId || typeof a.presente !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Cada asistencia debe incluir usuarioId y presente (boolean)',
        });
      }
      if (!mongoose.Types.ObjectId.isValid(a.usuarioId)) {
        return res.status(400).json({ success: false, message: 'usuarioId inválido en asistencias' });
      }
      if (!idsInscritos.has(String(a.usuarioId))) {
        return res.status(400).json({
          success: false,
          message: 'Un usuario en asistencias no está inscrito activo en el taller',
        });
      }
    }

    let geoDoc;
    if (geo && typeof geo.lat === 'number' && typeof geo.lng === 'number') {
      geoDoc = {
        lat: geo.lat,
        lng: geo.lng,
        accuracy: typeof geo.accuracy === 'number' ? geo.accuracy : undefined,
        capturadaEn: geo.capturadaEn ? new Date(geo.capturadaEn) : new Date(),
      };
    }

    const doc = await SesionTallerEjecutadaPteAlto.create({
      tallerId,
      creadoPor: new mongoose.Types.ObjectId(creadoPor),
      fechaHoraInicio: new Date(fechaHoraInicio),
      fechaHoraFin: new Date(fechaHoraFin),
      asistencias: asistencias.map((a) => ({
        usuarioId: a.usuarioId,
        presente: a.presente,
      })),
      geo: geoDoc,
    });

    const populated = await SesionTallerEjecutadaPteAlto.findById(doc._id)
      .populate('creadoPor', 'nombre apellido')
      .populate('asistencias.usuarioId', 'nombre apellido email');

    return res.status(201).json({
      success: true,
      message: 'Sesión registrada correctamente',
      response: formatearLista(populated),
    });
  } catch (error) {
    console.error('crearSesionEjecutada:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar la sesión',
      error: error.message,
    });
  }
};

const listarSesionesEjecutadasPorTaller = async (req, res) => {
  try {
    const { tallerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tallerId)) {
      return res.status(400).json({ success: false, message: 'tallerId inválido' });
    }

    const rows = await SesionTallerEjecutadaPteAlto.find({ tallerId })
      .sort({ fechaHoraFin: -1 })
      .populate('creadoPor', 'nombre apellido')
      .lean();

    const response = rows.map((doc) => {
      const { presentes, ausentes } = conteosDesdeAsistencias(doc.asistencias);
      return {
        _id: doc._id,
        tallerId: doc.tallerId,
        creadoPor: doc.creadoPor,
        fechaHoraInicio: doc.fechaHoraInicio,
        fechaHoraFin: doc.fechaHoraFin,
        presentes,
        ausentes,
        geo: doc.geo || null,
        createdAt: doc.createdAt,
      };
    });

    return res.json({ success: true, response });
  } catch (error) {
    console.error('listarSesionesEjecutadasPorTaller:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al listar sesiones',
      error: error.message,
    });
  }
};

const obtenerSesionEjecutadaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Id inválido' });
    }

    const doc = await SesionTallerEjecutadaPteAlto.findById(id)
      .populate('tallerId', 'nombre')
      .populate('creadoPor', 'nombre apellido')
      .populate(
        'asistencias.usuarioId',
        'nombre apellido email rut tipoDocumento telefono direccion fechaNacimiento sexo comuna'
      );

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Sesión no encontrada' });
    }

    const { presentes, ausentes } = conteosDesdeAsistencias(doc.asistencias);

    const rt = doc.tallerId;
    let tallerIdStr = '';
    let tallerNombre = null;
    if (rt && typeof rt === 'object' && rt.nombre !== undefined && rt.nombre !== null) {
      tallerIdStr = String(rt._id);
      tallerNombre = rt.nombre;
    } else if (rt) {
      tallerIdStr = String(rt);
    }

    return res.json({
      success: true,
      response: {
        _id: doc._id,
        tallerId: tallerIdStr,
        tallerNombre,
        creadoPor: doc.creadoPor,
        fechaHoraInicio: doc.fechaHoraInicio,
        fechaHoraFin: doc.fechaHoraFin,
        presentes,
        ausentes,
        asistencias: doc.asistencias,
        geo: doc.geo || null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (error) {
    console.error('obtenerSesionEjecutadaPorId:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la sesión',
      error: error.message,
    });
  }
};

module.exports = {
  crearSesionEjecutada,
  listarSesionesEjecutadasPorTaller,
  obtenerSesionEjecutadaPorId,
};
