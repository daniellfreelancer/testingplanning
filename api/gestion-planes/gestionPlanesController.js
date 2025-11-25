const Usuarios = require("../usuarios-complejos/usuariosComplejos");
const Planes = require("./gestionPlanes");
const PlanesN = require("./gestionPlanesN");
const VariantesPlanes = require("../variantes-planes/variantesPlanes");
const SuscripcionPlanes = require("../suscripcion-planes/suscripcionPlanes");

const queryPopulateUsuarios = [
  {
    path: 'usuarios',
    select: 'nombre apellido email rut pagos suscripciones',
  },
  {
    path: 'variantesPlan',
    select: 'dia horario horasDisponibles fechaInicio fechaFin',
    populate: {
      path: 'usuarios',
      select: 'nombre apellido email rut'
    }
  }

]


const queryPopulateUsuariosPlan = [
  {
    path: 'usuarios',
    select: 'nombre apellido email rut varianteCurso pagos suscripciones',
  }
]

const gestionPlanesController = {
  crearPlan: async (req, res) => {
    try {
      const nuevoPlan = new Planes(req.body);
      const planGuardado = await nuevoPlan.save();
      res.status(201).json({
        message: "Plan creado exitosamente",
        plan: planGuardado,
        success: true,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al crear el plan", error: error.message });
    }
  },
  editarPlan: async (req, res) => {
    try {
      const { id } = req.params;
      const planActualizado = await Planes.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!planActualizado) {
        return res.status(404).json({ message: "Plan no encontrado" });
      }
      res.status(200).json({
        message: "Plan actualizado exitosamente",
        plan: planActualizado,
        success: true,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al actualizar el plan", error: error.message });
    }
  },
  eliminarPlan: async (req, res) => {
    try {
      const { id } = req.params;
      //para poder eliminar un plan, primero hay que verificar que ningun usuario tenga asignado ese plan
      const plan = await Planes.findById(id);
      if (!plan) {
        return res.status(404).json({ message: "Plan no encontrado" });
      }
      if (plan.usuarios.length > 0) {
        return res
          .status(400)
          .json({
            message:
              "No se puede eliminar el plan, hay usuarios asignados a este plan",
          });
      }
      await Planes.findByIdAndDelete(id);
      res
        .status(200)
        .json({ message: "Plan eliminado exitosamente", success: true });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al eliminar el plan", error: error.message });
    }
  },
  planesPorInstitucion: async (req, res) => {
    try {
      const { institucion } = req.params;
      const planes = await Planes.find({ institucion }).populate(queryPopulateUsuariosPlan);
      res
        .status(200)
        .json({ message: "Planes encontrados exitosamente", planes });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener los planes", error: error.message });
    }
  },
  asignarPlanAUsuario: async (req, res) => {
    try {
      const { usuarioId, planId } = req.params;
      const { variante } = req.body; //opcional, solo para planes de tipo curso
      //verificar que el usuario y el plan existan
      const usuario = await Usuarios.findById(usuarioId);
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const plan = await Planes.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan no encontrado" });
      }

      //antes de asignar el plan, verificar que el usuario no tenga otro plan del mismo tipo
      if (plan.tipo === "curso" && usuario.planCurso) {
        return res
          .status(400)
          .json({ message: "El usuario ya tiene un plan de curso asignado" });
      }
      if (plan.tipo === "nadoLibre" && usuario.planNL) {
        return res
          .status(400)
          .json({ message: "El usuario ya tiene un plan de nado libre asignado" });
      }
      if (plan.tipo === "gimnasio" && usuario.planGym) {
        return res
          .status(400)
          .json({ message: "El usuario ya tiene un plan de gimnasio asignado" });
      }

      //asignar el plan al usuario
      if (plan.tipo === "curso") {
        usuario.planCurso = plan._id;
        usuario.varianteCurso = variante;
      } else if (plan.tipo === "nadoLibre") {
        usuario.planNL = plan._id;
      } else if (plan.tipo === "gimnasio") {
        usuario.planGym = plan._id;
      } else {
        return res.status(400).json({ message: "Tipo de plan no válido" });
      }
      await usuario.save();
      //agregar el usuario al plan
      plan.usuarios.push(usuario._id);
      await plan.save();

      res
        .status(200)
        .json({
          message: "Plan asignado al usuario exitosamente",
          usuario,
          plan,
          success: true,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al asignar el plan al usuario",
          error: error.message,
        });
    }
  },
  quitarPlanAUsuario: async (req, res) => {

    try {
      const { usuarioId, planId } = req.params;
      //verificar que el usuario y el plan existan
      const usuario = await Usuarios.findById(usuarioId);
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const plan = await Planes.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan no encontrado" });
      }

      //quitar el plan al usuario
      if (plan.tipo === "curso") {
        usuario.planCurso = null;
      } else if (plan.tipo === "nadoLibre") {
        usuario.planNL = null;
      } else if (plan.tipo === "gimnasio") {
        usuario.planGym = null;
      } else {
        return res.status(400).json({ message: "Tipo de plan no válido" });
      }
      await usuario.save();
      //quitar el usuario del plan
      plan.usuarios = plan.usuarios.filter(
        (userId) => userId.toString() !== usuario._id.toString()
      );
      await plan.save();

      res
        .status(200)
        .json({
          message: "Plan quitado al usuario exitosamente",
          usuario,
          plan,
          success: true,
        });

    } catch (error) {
      console.log(error)
      res
        .status(500)
        .json({
          message: "Error al quitar el plan al usuario",
          error: error.message,
        });



    }


  },
  crearPlanN: async (req, res) => {
    try {
      const { variantes } = req.body; // array de variantes
      const nuevoPlanN = new PlanesN(req.body);

      let variantesGuardadas = [];

      if (variantes && variantes.length > 0) {

        for (const variante of variantes) {
          const nuevaVariante = new VariantesPlanes({ planId: nuevoPlanN._id, ...variante });
          await nuevaVariante.save();
          variantesGuardadas.push(nuevaVariante._id);
        }

        //asignar las variantes al plan
        nuevoPlanN.variantesPlan = variantesGuardadas;
        await nuevoPlanN.save();

        res.status(201).json({ message: "Plan N creado exitosamente", planN: nuevoPlanN, success: true, variantes: variantesGuardadas });
      }

    } catch (error) {
      res.status(500).json({ message: "Error al crear el plan N", error: error.message });
    }
  },
  editarPlanN: async (req, res) => {
    try {
      const { id } = req.params;
      const planActualizado = await PlanesN.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json({ message: "Plan N actualizado exitosamente", planN: planActualizado, success: true });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el plan N", error: error.message });
    }
  },
  eliminarPlanN: async (req, res) => {
    try {
      const { id } = req.params;
      await PlanesN.findByIdAndDelete(id);

      //ELIMINAR LAS VARIANTES DEL PLAN
      const variantes = await VariantesPlanes.find({ planId: id });
      for (const variante of variantes) {
        await VariantesPlanes.findByIdAndDelete(variante._id);
      }

      res.status(200).json({ message: "Plan N eliminado exitosamente", success: true });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el plan N", error: error.message });
    }
  }
  ,
  planesNPorInstitucion: async (req, res) => {
    try {
      const { institucion } = req.params;
      const planesN = await PlanesN.find({ institucion }).populate(queryPopulateUsuarios);
      res.status(200).json({ message: "Planes N encontrados exitosamente", planesN });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los planes N", error: error.message });
    }
  },
  crearVariantePlanN: async (req, res) => {

    const { planId, variante } = req.body;

    try {

      const nuevaVariante = new VariantesPlanes({ planId, ...variante });
      await nuevaVariante.save();
      //buscar el plan y agregar la variante al plan
      const plan = await PlanesN.findById(planId);
      plan.variantesPlan.push(nuevaVariante._id);
      await plan.save();

      res.status(201).json({ message: "Variante creada exitosamente", variante: nuevaVariante, success: true });

    } catch (error) {
      res.status(500).json({ message: "Error al crear la variante", error: error.message });
    }

  },
  eliminarVariantePlanN: async (req, res) => {
    const { id } = req.params;
    try {
      const variante = await VariantesPlanes.findByIdAndDelete(id);

      //buscar el plan y eliminar la variante del plan
      const plan = await PlanesN.findById(variante.planId);
      plan.variantesPlan = plan.variantesPlan.filter(v => v._id.toString() !== variante._id.toString());
      await plan.save();

      res.status(200).json({ message: "Variante eliminada exitosamente", success: true });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar la variante", error: error.message });
    }
  },
  editarVariantePlanN: async (req, res) => {
    const { id } = req.params;

    try {
      const varianteActualizada = await VariantesPlanes.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json({ message: "Variante actualizada exitosamente", variante: varianteActualizada, success: true });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar la variante", error: error.message });
    }
  },
  statsPlanesN: async (req, res) => {
    try {
      const stats = await PlanesN.find().populate({
        path: 'variantesPlan',
        select: 'dia horario horasDisponibles fechaInicio fechaFin planId usuarios'
      });

      let cursos = []
      let nadoLibre = []
      let gimnasio = []
      let cursoTemporada = []

      for (const plan of stats) {
        if (plan.tipo === 'curso') {
          cursos.push({ nombrePlan: plan.nombrePlan, variantes: plan.variantesPlan });

        } else if (plan.tipo === 'nadoLibre') {
          nadoLibre.push({ nombrePlan: plan.nombrePlan, variantes: plan.variantesPlan });
        }
        if (plan.tipo === 'gimnasio') {
          gimnasio.push({ nombrePlan: plan.nombrePlan, variantes: plan.variantesPlan });
        }
        if (plan.tipo === 'cursoTemporada') {
          cursoTemporada.push({ nombrePlan: plan.nombrePlan, variantes: plan.variantesPlan });
        }
      }

      res.status(200).json({
        message: "Stats obtenidas exitosamente",
        success: true,
        cursos: cursos,
        nadoLibre: nadoLibre,
        gimnasio: gimnasio,
        cursoTemporada: cursoTemporada,
      });

    } catch (error) {
      res.status(500).json({ message: "Error al obtener las stats", error: error.message });
    }
  },
  statsSuscripciones: async (req, res) => {

    /**
     * Ejemplo log
     * {
      "_id": "68efdf61124d4be4a57d1160",
      "planId": {
      "_id": "68e6e78c4e3edd13eb6d2752",
      "tipo": "nadoLibre",
      "nombrePlan": "Nado libre 4"
      },
      "varianteId": {
      "_id": "68e6e78c4e3edd13eb6d2753",
      "dia": "Nado Libre",
      "horario": "Flexible"
      },
      "fechaInicio": "2025-10-15T14:51:00.000Z",
      "fechaFin": "2025-11-14T00:00:00.000Z",
      "horasDisponibles": 0
      },
     * 
     * 
     * 
     */

    try {
      const stats = await SuscripcionPlanes.find()
        .populate({
          path: 'planId',
          select: 'nombrePlan tipo'
        })
        .populate({
          path: 'varianteId',
          select: 'dia horario'
        }).select('planId varianteId fechaInicio fechaFin horasDisponibles')

      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate());

      // dia 6 del proximo mes
      let fechaFinCurso = new Date();
      fechaFinCurso.setDate(6);
      fechaFinCurso.setMonth(fechaFinCurso.getMonth() + 1);
      fechaFinCurso.setHours(0, 0, 0, 0);

      //dia 25 del mes anterior
      let fechaInicioCurso = new Date();
      fechaInicioCurso.setDate(24);
      fechaInicioCurso.setMonth(fechaInicioCurso.getMonth() - 1);
      fechaInicioCurso.setHours(0, 0, 0, 0);




      //para cursos el planId?.tipo sea igual a curso y fechaFin sea igual o menor a tomorrow
      let cursos = stats.filter((suscripcion) => {
        //normalizar la fechaFin
        let fechaFin = new Date(suscripcion.fechaFin);

        // fechaFin.setHours(0, 0, 0, 0);
        // if (suscripcion.planId?.tipo === 'curso' && fechaFin <= fechaFinCurso && suscripcion.fechaInicio >= fechaInicioCurso) {
        //   return true;
        // }

        fechaFin.setHours(0, 0, 0, 0);
        if (suscripcion.planId?.tipo === 'curso' && fechaFin >= tomorrow) {
          return true;
        }

        return false;
      });

      // para nado libre el planId?.tipo sea igual a nadoLibre y fechaFin sea igual o menor a tomorrow y horasDisponibles sea mayor a 0
      let nadoLibre = stats.filter((suscripcion) => {

        let fechaFin = new Date(suscripcion.fechaFin);
        if (suscripcion.planId?.tipo === 'nadoLibre' && fechaFin >= tomorrow && suscripcion.horasDisponibles > 0) {
          return true;
        }
        return false;
      });

      // para gimnasio el planId?.tipo sea igual a gimnasio y fechaFin sea igual o menor a tomorrow
      let gimnasio = stats.filter((suscripcion) => {
        //normalizar la fechaFin
        let fechaFin = new Date(suscripcion.fechaFin);
        fechaFin.setHours(0, 0, 0, 0);
        if (suscripcion.planId?.tipo === 'gimnasio' && fechaFin >= tomorrow) {
          return true;
        }
        return false;
      });


      // para curso temporada el planId?.tipo sea igual a cursoTemporada y fechaFin sea igual o menor a tomorrow
      let cursoTemporada = stats.filter((suscripcion) => {
        if (suscripcion.planId?.tipo === 'cursoTemporada') {
          return true;
        }
        return false;
      });

      res.status(200).json({
        message: "Stats obtenidas exitosamente",
        cursos,
        cantidadCursos: cursos.length,
        cursoTemporada,
        cantidadCursoTemporada: cursoTemporada.length,
        gimnasio,
        cantidadGimnasio: gimnasio.length,
        success: true
      });

    } catch (error) {
      res.status(500).json({ message: "Error al obtener las stats de suscripciones", error: error.message });
    }
  }
};
module.exports = gestionPlanesController;
