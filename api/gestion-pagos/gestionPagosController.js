const Usuarios = require("../usuarios-complejos/usuariosComplejos");
const GestionPagos = require("./gestionPagos");
const SuscripcionPlanes = require("../suscripcion-planes/suscripcionPlanes");
const VariantesPlanes = require("../variantes-planes/variantesPlanes");
const GestionPlanesN = require("../gestion-planes/gestionPlanesN");


const populateOptions = [
    { path: 'usuario', select: 'nombre apellido email rut' },
    { path: 'institucion', select: 'nombre' },
    { path: 'recepcion', select: 'nombre apellido email rut' },
    { path: 'planCurso', select: 'tipoPlan plan valor dias ' },
    { path: 'planNL', select: 'tipoPlan plan valor dias' },
    { path: 'planGym', select: 'tipoPlan plan valor dias' },
    {path: 'planId', select: 'tipo tipoPlan plan valor dias'}
]



const gestionPagosController = {
    registrarPago: async (req, res) => {

        try {
            const { usuarioID } = req.params

            const nuevoPago = new GestionPagos(req.body);
            const pagoGuardado = await nuevoPago.save();

            //agregar el pago al usuario
            await Usuarios.findByIdAndUpdate(usuarioID, { $push: { pagos: pagoGuardado._id } });

            res.status(201).json({
                message: "Pago registrado exitosamente",
                pago: pagoGuardado,
                success: true,
            });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Error al registrar el pago", error: error.message });

        }

    },
    pagosInstitucion: async (req, res) => {

        try {
            const { institucion } = req.params;
            const pagos = await GestionPagos.find({ institucion }).populate(populateOptions);
            res.status(200).json({ pagos, success: true });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Error al obtener los pagos de la institución", error: error.message });

        }

    },
    crearSuscripcion: async (req, res) => {
        const { transaccion, voucher, monto, fechaPago, recepcion, fechaFin, beneficio, tipoConsumo, horasDisponibles, } = req.body;
        const { planId, varianteId, usuarioId, institucionId } = req.params;

        try {
            const pago = new GestionPagos({
                usuario: usuarioId,
                institucion: institucionId,
                transaccion: transaccion,
                voucher: voucher,
                monto: monto,
                fechaPago: fechaPago,
                recepcion: recepcion,
                planId: planId,
                beneficio: beneficio,
            });
            const pagoGuardado = await pago.save();
            //luego de crear el pago, crear la suscripcion
            const suscripcion = new SuscripcionPlanes({
                usuario: usuarioId,
                planId: planId,
                varianteId: varianteId,
                fechaInicio: fechaPago,
                fechaFin: fechaFin,
                pago: pagoGuardado._id,
                tipoConsumo: tipoConsumo,
                horasDisponibles: horasDisponibles,
                institucion: institucionId,

            });
            const suscripcionGuardada = await suscripcion.save();
            //agregar el usuario a la variante
            await VariantesPlanes.findByIdAndUpdate(varianteId, { $push: { usuarios: usuarioId } });

            //response global
            res.status(201).json({
                message: "Suscripcion creada exitosamente",
                suscripcion: suscripcionGuardada,
                pago: pagoGuardado,
                success: true,
            });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Error al crear la suscripcion", error: error.message });

        }

    },
    getPagosToday: async (req, res) => {


        try {
            // Obtener la fecha actual en el inicio y final del día
            const today = new Date();
            
            // Crear fechas usando formato ISO sin zona horaria
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            
            const startOfDay = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
            const endOfDay = new Date(`${year}-${month}-${day}T23:59:59.999Z`);
            
            console.log("startOfDay", startOfDay);
            console.log("endOfDay", endOfDay);
            console.log("today", today);

            // Filtrar pagos por fecha del día actual
            const pagos = await GestionPagos.find({
                fechaPago: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }).populate(populateOptions);

            if (pagos.length > 0) {     
                res.status(200).json({
                    message: "Pagos del día obtenidos correctamente",
                    pagos,
                    success: true,
                });
            } else {
                res.status(200).json({
                    message: "No se encontraron pagos del día",
                    pagos: [],
                    success: true,
                });
            }
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los pagos del día", error: error.message });
        }
    }

}

module.exports = gestionPagosController