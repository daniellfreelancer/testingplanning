const Usuarios = require("../usuarios-complejos/usuariosComplejos");
const Planes = require("./gestionPlanes");
const PlanesN = require("./gestionPlanesN");
const VariantesPlanes = require("../variantes-planes/variantesPlanes");

const queryPopulateUsuarios = [
  {
    path: 'usuarios',
    select: 'nombre apellido email rut varianteCurso pagos suscripciones',
    populate: {
      path: 'variantesPlan',
      select: 'dia horario'
    }
  },
  {
    path: 'variantesPlan',
    select: 'dia horario',
    populate: {
      path: 'usuarios',
      select: 'nombre apellido email rut'
    }
  },

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
      const planes = await Planes.find({ institucion }).populate(queryPopulateUsuarios);
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
  }
};

module.exports = gestionPlanesController;
