const mongoose = require('mongoose');
const GruposPiscinaStgo = require('./gruposPiscinaStgo');
const VariantesPlanes = require('../../variantes-planes/variantesPlanes');
const UsuariosComplejos = require('../../usuarios-complejos/usuariosComplejos');
const SuscripcionPlanes = require('../../suscripcion-planes/suscripcionPlanes');


const DIAS_SEMANA_MAP = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4,
  viernes: 5, sabado: 6,
};

const MESES_MAP = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

function normalizarTexto(texto) {
  return String(texto).trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function parseMes(mes) {
  const num = parseInt(mes);
  if (!isNaN(num) && num >= 1 && num <= 12) return num;
  return MESES_MAP[normalizarTexto(mes)] || null;
}

function obtenerFechasDelMes(mes, año, diasSemana) {
  const mesNum = parseMes(mes);
  const añoNum = parseInt(año);
  if (!mesNum || isNaN(añoNum)) return [];

  const diasEnMes = new Date(añoNum, mesNum, 0).getDate();
  const fechas = [];

  for (let d = 1; d <= diasEnMes; d++) {
    const fecha = new Date(añoNum, mesNum - 1, d);
    const diaSemanaJS = fecha.getDay();

    for (const dia of diasSemana) {
      const diaNorm = normalizarTexto(dia);
      const diaNum = DIAS_SEMANA_MAP[diaNorm];
      if (diaNum !== undefined && diaSemanaJS === diaNum) {
        fechas.push({ fecha: fecha.toISOString().split('T')[0], dia: diaNorm });
        break;
      }
    }
  }

  return fechas;
}

function construirAsistencia(fechas, usuarios) {
  return fechas.map((f) => ({
    fecha: f.fecha,
    dia: f.dia,
    registros: usuarios.map((u) => ({
      usuarioId: u._id,
      nombre: u.nombre,
      apellido: u.apellido,
      presente: null,
    })),
  }));
}

async function obtenerDiasDesdeVariantes(variantesIds) {
  const variantes = await VariantesPlanes.find({ _id: { $in: variantesIds } })
    .select('dia')
    .lean();
  return variantes.map((v) => v.dia).filter(Boolean);
}

const populateGrupo = [
  { path: 'variantesId', select: 'dia horario horasDisponibles fechaInicio fechaFin' },
  { path: 'planId', select: 'nombrePlan tipo valor duracion' },
  { path: 'profesor', select: 'nombre apellido email rut' },
];

const gruposPiscinaStgoController = {

  crearGrupoPiscinaStgo: async (req, res) => {
    try {
      const { mes, año, variantesId, planId, nivel, capacidad } = req.body;

      if (!mes || !año || !nivel || !capacidad) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: mes, año, nivel, capacidad',
        });
      }

      const diasSemana = variantesId?.length
        ? await obtenerDiasDesdeVariantes(variantesId)
        : [];

      const fechas = obtenerFechasDelMes(mes, año, diasSemana);
      const asistencia = construirAsistencia(fechas, []);

      const nuevoGrupo = new GruposPiscinaStgo({
        mes,
        año,
        variantesId: variantesId || [],
        planId: planId || undefined,
        nivel,
        capacidad: Number(capacidad),
        usuarios: [],
        asistencia,
      });

      await nuevoGrupo.save();
      const grupoPopulado = await GruposPiscinaStgo.findById(nuevoGrupo._id)
        .populate(populateGrupo).lean();

      res.status(201).json({
        success: true,
        message: 'Grupo creado correctamente',
        grupo: grupoPopulado,
      });
    } catch (error) {
      console.error('Error al crear grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear grupo',
        error: error.message,
      });
    }
  },

  obtenerGruposPiscinaStgo: async (req, res) => {
    try {
      const grupos = await GruposPiscinaStgo.find()
        .populate(populateGrupo)
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({
        success: true,
        grupos,
        total: grupos.length,
      });
    } catch (error) {
      console.error('Error al obtener grupos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener grupos',
        error: error.message,
      });
    }
  },

  obtenerGrupoPiscinaStgo: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID no válido' });
      }

      const grupo = await GruposPiscinaStgo.findById(id)
        .populate(populateGrupo).lean();

      if (!grupo) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }

      res.status(200).json({ success: true, grupo });
    } catch (error) {
      console.error('Error al obtener grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener grupo',
        error: error.message,
      });
    }
  },

  actualizarProfesoresGrupoPiscinaStgo: async (req, res) => {
    try {
      const { id } = req.params;
      const { profesorId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID de grupo no válido' });
      }
      if (!profesorId || !mongoose.Types.ObjectId.isValid(profesorId)) {
        return res.status(400).json({ success: false, message: 'ID de profesor no válido' });
      }

      const grupo = await GruposPiscinaStgo.findByIdAndUpdate(
        id,
        { profesor: profesorId },
        { new: true }
      ).populate(populateGrupo).lean();

      if (!grupo) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }

      res.status(200).json({
        success: true,
        message: 'Profesor asignado correctamente',
        grupo,
      });
    } catch (error) {
      console.error('Error al asignar profesor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al asignar profesor',
        error: error.message,
      });
    }
  },

  eliminarProfesorGrupoPiscinaStgo: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID de grupo no válido' });
      }

      const grupo = await GruposPiscinaStgo.findByIdAndUpdate(
        id,
        { $unset: { profesor: '' } },
        { new: true }
      ).populate(populateGrupo).lean();

      if (!grupo) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }

      res.status(200).json({
        success: true,
        message: 'Profesor removido del grupo',
        grupo,
      });
    } catch (error) {
      console.error('Error al remover profesor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al remover profesor',
        error: error.message,
      });
    }
  },

  actualizarUsuariosGrupoPiscinaStgo: async (req, res) => {
    try {
      const { id } = req.params;
      const { usuario } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID de grupo no válido' });
      }
      if (!usuario || !usuario._id || !usuario.nombre || !usuario.apellido) {
        return res.status(400).json({
          success: false,
          message: 'Datos de usuario requeridos: _id, nombre, apellido',
        });
      }

      const grupo = await GruposPiscinaStgo.findById(id);
      if (!grupo) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }

      const yaExiste = grupo.usuarios.some(
        (u) => u._id?.toString() === usuario._id.toString()
      );
      if (yaExiste) {
        return res.status(409).json({
          success: false,
          message: 'El usuario ya está en este grupo',
        });
      }

      if (grupo.usuarios.length >= grupo.capacidad) {
        return res.status(400).json({
          success: false,
          message: `El grupo ya alcanzó su capacidad máxima (${grupo.capacidad})`,
        });
      }

      const nuevoUsuario = {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        finPlan: usuario.finPlan || null,
      };

      grupo.usuarios.push(nuevoUsuario);

      for (const dia of grupo.asistencia) {
        dia.registros.push({
          usuarioId: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          presente: null,
        });
      }

      grupo.markModified('usuarios');
      grupo.markModified('asistencia');
      await grupo.save();

      const grupoPopulado = await GruposPiscinaStgo.findById(id)
        .populate(populateGrupo).lean();

      res.status(200).json({
        success: true,
        message: 'Usuario agregado al grupo',
        grupo: grupoPopulado,
      });
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al agregar usuario al grupo',
        error: error.message,
      });
    }
  },

  eliminarUsuarioGrupoPiscinaStgo: async (req, res) => {
    try {
      const { id, usuarioId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID de grupo no válido' });
      }

      const grupo = await GruposPiscinaStgo.findById(id);
      if (!grupo) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }

      const existia = grupo.usuarios.some(
        (u) => u._id?.toString() === usuarioId
      );
      if (!existia) {
        return res.status(404).json({
          success: false,
          message: 'El usuario no está en este grupo',
        });
      }

      grupo.usuarios = grupo.usuarios.filter(
        (u) => u._id?.toString() !== usuarioId
      );

      for (const dia of grupo.asistencia) {
        dia.registros = dia.registros.filter(
          (r) => r.usuarioId?.toString() !== usuarioId
        );
      }

      grupo.markModified('usuarios');
      grupo.markModified('asistencia');
      await grupo.save();

      const grupoPopulado = await GruposPiscinaStgo.findById(id)
        .populate(populateGrupo).lean();

      res.status(200).json({
        success: true,
        message: 'Usuario removido del grupo',
        grupo: grupoPopulado,
      });
    } catch (error) {
      console.error('Error al remover usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al remover usuario del grupo',
        error: error.message,
      });
    }
  },

  actualizarVariantesGrupoPiscinaStgo: async (req, res) => {
    try {
      const { id } = req.params;
      const { variantesId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID de grupo no válido' });
      }
      if (!Array.isArray(variantesId) || variantesId.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de variantesId',
        });
      }

      const grupo = await GruposPiscinaStgo.findById(id);
      if (!grupo) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }

      const diasSemana = await obtenerDiasDesdeVariantes(variantesId);
      const nuevasFechas = obtenerFechasDelMes(grupo.mes, grupo.año, diasSemana);

      const asistenciaExistente = {};
      for (const dia of grupo.asistencia) {
        asistenciaExistente[dia.fecha] = dia;
      }

      const nuevaAsistencia = nuevasFechas.map((f) => {
        if (asistenciaExistente[f.fecha]) {
          return asistenciaExistente[f.fecha];
        }
        return {
          fecha: f.fecha,
          dia: f.dia,
          registros: grupo.usuarios.map((u) => ({
            usuarioId: u._id,
            nombre: u.nombre,
            apellido: u.apellido,
            presente: null,
          })),
        };
      });

      grupo.variantesId = variantesId;
      grupo.asistencia = nuevaAsistencia;

      grupo.markModified('asistencia');
      await grupo.save();

      const grupoPopulado = await GruposPiscinaStgo.findById(id)
        .populate(populateGrupo).lean();

      res.status(200).json({
        success: true,
        message: 'Variantes actualizadas y asistencia recalculada',
        grupo: grupoPopulado,
      });
    } catch (error) {
      console.error('Error al actualizar variantes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar variantes',
        error: error.message,
      });
    }
  },

  eliminarVarianteGrupoPiscinaStgo: async (req, res) => {
    try {
      const { id, varianteId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID de grupo no válido' });
      }

      const grupo = await GruposPiscinaStgo.findById(id);
      if (!grupo) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }

      grupo.variantesId = grupo.variantesId.filter(
        (v) => v.toString() !== varianteId
      );

      const diasSemana = grupo.variantesId.length
        ? await obtenerDiasDesdeVariantes(grupo.variantesId)
        : [];
      const fechasValidas = obtenerFechasDelMes(grupo.mes, grupo.año, diasSemana);
      const fechasSet = new Set(fechasValidas.map((f) => f.fecha));

      grupo.asistencia = grupo.asistencia.filter((a) => fechasSet.has(a.fecha));

      grupo.markModified('asistencia');
      await grupo.save();

      const grupoPopulado = await GruposPiscinaStgo.findById(id)
        .populate(populateGrupo).lean();

      res.status(200).json({
        success: true,
        message: 'Variante eliminada del grupo',
        grupo: grupoPopulado,
      });
    } catch (error) {
      console.error('Error al eliminar variante:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar variante del grupo',
        error: error.message,
      });
    }
  },

  actualizarPlanGrupoPiscinaStgo: async (req, res) => {
    try {
      const { id } = req.params;
      const { planId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID de grupo no válido' });
      }
      if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
        return res.status(400).json({ success: false, message: 'ID de plan no válido' });
      }

      const grupo = await GruposPiscinaStgo.findByIdAndUpdate(
        id,
        { planId },
        { new: true }
      ).populate(populateGrupo).lean();

      if (!grupo) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }

      res.status(200).json({
        success: true,
        message: 'Plan actualizado correctamente',
        grupo,
      });
    } catch (error) {
      console.error('Error al actualizar plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar plan',
        error: error.message,
      });
    }
  },

  eliminarPlanGrupoPiscinaStgo: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID de grupo no válido' });
      }

      const grupo = await GruposPiscinaStgo.findByIdAndUpdate(
        id,
        { $unset: { planId: '' } },
        { new: true }
      ).populate(populateGrupo).lean();

      if (!grupo) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }

      res.status(200).json({
        success: true,
        message: 'Plan removido del grupo',
        grupo,
      });
    } catch (error) {
      console.error('Error al remover plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error al remover plan del grupo',
        error: error.message,
      });
    }
  },

  actualizarGrupoPiscinaStgo: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID de grupo no válido' });
      }

      const camposPermitidos = {};
      const { mes, año, nivel, capacidad, status } = req.body;

      if (mes !== undefined) camposPermitidos.mes = mes;
      if (año !== undefined) camposPermitidos.año = año;
      if (nivel !== undefined) camposPermitidos.nivel = nivel;
      if (capacidad !== undefined) camposPermitidos.capacidad = Number(capacidad);
      if (status !== undefined) camposPermitidos.status = status;

      const grupo = await GruposPiscinaStgo.findByIdAndUpdate(
        id,
        camposPermitidos,
        { new: true, runValidators: true }
      ).populate(populateGrupo).lean();

      if (!grupo) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }

      res.status(200).json({
        success: true,
        message: 'Grupo actualizado correctamente',
        grupo,
      });
    } catch (error) {
      console.error('Error al actualizar grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar grupo',
        error: error.message,
      });
    }
  },

  marcarAsistenciaGrupoPiscinaStgo: async (req, res) => {
    try {
      const { id } = req.params;
      const { fecha, registros } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID de grupo no válido' });
      }
      if (!fecha || !Array.isArray(registros)) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere fecha (YYYY-MM-DD) y registros [{ usuarioId, presente }]',
        });
      }

      const grupo = await GruposPiscinaStgo.findById(id);
      if (!grupo) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }

      const diaAsistencia = grupo.asistencia.find((a) => a.fecha === fecha);
      if (!diaAsistencia) {
        return res.status(404).json({
          success: false,
          message: `No existe registro de asistencia para la fecha ${fecha}`,
        });
      }

      for (const reg of registros) {
        const registro = diaAsistencia.registros.find(
          (r) => r.usuarioId?.toString() === reg.usuarioId
        );
        if (registro) {
          registro.presente = reg.presente;
        }
      }

      grupo.markModified('asistencia');
      await grupo.save();

      res.status(200).json({
        success: true,
        message: `Asistencia del ${fecha} actualizada`,
        asistenciaDia: diaAsistencia,
      });
    } catch (error) {
      console.error('Error al marcar asistencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error al marcar asistencia',
        error: error.message,
      });
    }
  },

  obtenerAsistenciaGrupoPiscinaStgo: async (req, res) => {
    try {
      const { id } = req.params;
      const { fecha } = req.query;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'ID de grupo no válido' });
      }

      const grupo = await GruposPiscinaStgo.findById(id)
        .select('mes año asistencia usuarios')
        .lean();

      if (!grupo) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }

      if (fecha) {
        const diaAsistencia = grupo.asistencia.find((a) => a.fecha === fecha);
        if (!diaAsistencia) {
          return res.status(404).json({
            success: false,
            message: `No existe registro de asistencia para la fecha ${fecha}`,
          });
        }
        return res.status(200).json({
          success: true,
          asistencia: diaAsistencia,
        });
      }

      res.status(200).json({
        success: true,
        mes: grupo.mes,
        año: grupo.año,
        totalDias: grupo.asistencia.length,
        totalUsuarios: grupo.usuarios.length,
        asistencia: grupo.asistencia,
      });
    } catch (error) {
      console.error('Error al obtener asistencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener asistencia',
        error: error.message,
      });
    }
  },
  buscarUsuarioPiscinaPorRut: async (req, res) => {
    try {
      const { rut } = req.params;

      if (!rut) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el RUT del usuario',
        });
      }

      const rutLimpio = String(rut).trim().toUpperCase().replace(/\./g, '').replace(/-/g, '');

      const usuario = await UsuariosComplejos.findOne({
        rut: { $regex: new RegExp(`^${rutLimpio}$`, 'i') },
      })
        .select('nombre apellido rut email telefono status suscripciones tipoPlan nivelCurso')
        .lean();

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'El usuario no está registrado',
        });
      }

      if (!usuario.status) {
        return res.status(400).json({
          success: false,
          message: 'El usuario no está activo',
          usuario: {
            _id: usuario._id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            rut: usuario.rut,
          },
        });
      }

      const ahora = new Date();
      const suscripcion = await SuscripcionPlanes.findOne({
        usuario: usuario._id,
        status: true,
        fechaFin: { $gte: ahora },
      })
        .sort({ fechaFin: -1 })
        .populate({ path: 'planId', select: 'nombrePlan tipo' })
        .populate({ path: 'varianteId', select: 'dia horario' })
        .lean();

      if (!suscripcion) {
        return res.status(400).json({
          success: false,
          message: 'El usuario no tiene una suscripción activa',
          usuario: {
            _id: usuario._id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            rut: usuario.rut,
          },
        });
      }

      res.status(200).json({
        success: true,
        message: 'Usuario encontrado con suscripción activa',
        usuario: {
          _id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rut: usuario.rut,
          email: usuario.email,
          telefono: usuario.telefono,
        },
        suscripcion: {
          _id: suscripcion._id,
          plan: suscripcion.planId,
          variante: suscripcion.varianteId,
          fechaInicio: suscripcion.fechaInicio,
          fechaFin: suscripcion.fechaFin,
          nivel: suscripcion.nivel,
        },
      });
    } catch (error) {
      console.error('Error al buscar usuario por RUT:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar usuario',
        error: error.message,
      });
    }
  }
};

module.exports = gruposPiscinaStgoController;