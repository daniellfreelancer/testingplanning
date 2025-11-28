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
    { path: 'planId', select: 'tipo nombrePlan valor' }
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
    crearSuscripcion: async (req, res) => {
        const { transaccion, voucher, monto, fechaPago, recepcion, fechaFin, beneficio, tipoConsumo, horasDisponibles, nivelCurso, aptoNadolibre } = req.body;
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

            //actualiza el status del usuario a true
            await Usuarios.findByIdAndUpdate(usuarioId, { $set: { status: true, nivelCurso: nivelCurso || "", aptoNadolibre: aptoNadolibre ? aptoNadolibre : false } });


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
        const { institucion } = req.params;
        const { recepcion } = req.query;

        console.log("=== getPagosToday ===");
        console.log("Institucion:", institucion);
        console.log("Recepcion query:", recepcion);

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

            // Construir el filtro dinámicamente
            const filtro = {
                fechaPago: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                institucion: institucion
            };

            // Solo agregar el filtro de recepcion si se proporciona
            if (recepcion) {
                filtro.recepcion = recepcion;
            }

            console.log("Filtro aplicado:", filtro);

            // Filtrar pagos por fecha del día actual
            const pagos = await GestionPagos.find(filtro).populate(populateOptions);

            console.log("Pagos encontrados:", pagos.length);

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
            console.error("Error en getPagosToday:", error);
            res.status(500).json({ 
                message: "Error al obtener los pagos del día", 
                error: error.message 
            });
        }
    },
    getPagosByUsuario: async (req, res) => {
        const { usuarioId } = req.params;

        try {
            const pagos = await GestionPagos.find({ usuario: usuarioId }).populate(populateOptions);
            res.status(200).json({
                message: "Pagos obtenidos correctamente",
                pagos,
                success: true,
            });

        } catch (error) {
            res.status(500).json({ message: "Error al obtener los pagos del usuario", error: error.message });
        }
    },
    getPagosByInstitucion: async (req, res) => {
        const { institucionId } = req.params;
        const { recepcion } = req.query;

        console.log("=== getPagosByInstitucion ===");
        console.log("Institucion ID:", institucionId);
        console.log("Recepcion query:", recepcion);

        try {
            // Construir el filtro dinámicamente
            const filtro = { institucion: institucionId };
            
            // Solo agregar el filtro de recepcion si se proporciona
            if (recepcion) {
                filtro.recepcion = recepcion;
            }

            console.log("Filtro aplicado:", filtro);

            const pagos = await GestionPagos.find(filtro).populate(populateOptions);

            console.log("Pagos encontrados:", pagos.length);

            res.status(200).json({
                message: "Pagos obtenidos correctamente",
                pagos,
                success: true,
            });
        }
        catch (error) {
            console.error("Error en getPagosByInstitucion:", error);
            res.status(500).json({ 
                message: "Error al obtener los pagos de la institución", 
                error: error.message 
            });
        }
    },
    getUltimoPagoByUsuario: async (req, res) => {
        const { usuarioId } = req.params;

        try {
            const pago = await GestionPagos.findOne({ usuario: usuarioId }).sort({ fechaPago: -1 }).populate(populateOptions);
            res.status(200).json({
                message: "Pago obtenido correctamente",
                pago,
                success: true,
            });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener el último pago del usuario", error: error.message });
        }

    },
    crearRenovacion: async (req, res) => {
        const { transaccion, voucher, monto, fechaPago, recepcion, fechaFin, beneficio, } = req.body;
        const { suscripcionId } = req.params;

        try {
            ///buscamos primero la suscripcion
            const suscripcion = await SuscripcionPlanes.findById(suscripcionId);
            if (!suscripcion) {
                return res.status(404).json({ message: "Suscripcion no encontrada" });
            }

            const pago = new GestionPagos({
                usuario: suscripcion.usuario,
                institucion: suscripcion.institucion,
                transaccion: transaccion,
                voucher: voucher,
                monto: monto,
                fechaPago: fechaPago,
                recepcion: recepcion,
                planId: suscripcion.planId,
                beneficio: beneficio,
            });

            const pagoGuardado = await pago.save();

            ///actualizamos la suscripcion
            await SuscripcionPlanes.findByIdAndUpdate(suscripcionId, { $set: { pago: pagoGuardado._id, fechaFin: fechaFin } });
            ///agregar el pago al usuario
            await Usuarios.findByIdAndUpdate(suscripcion.usuario, { $push: { pagos: pagoGuardado._id }, $set: { status: true } });

            res.status(201).json({ message: "Renovacion creada exitosamente", pago: pagoGuardado, success: true });


        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Error al crear la renovacion", error: error.message });
        }
    },
    crearPago: async (req, res) => {
        const { transaccion, voucher, monto, fechaPago, recepcion, descripcion } = req.body;
        const { usuarioId, institucionId } = req.params;

        try {
            const pago = new GestionPagos({ usuario: usuarioId, institucion: institucionId, transaccion: transaccion, voucher: voucher, monto: monto, fechaPago: fechaPago, recepcion: recepcion, descripcion: descripcion });
            const pagoGuardado = await pago.save();
            //agregar el pago al usuario
            await Usuarios.findByIdAndUpdate(usuarioId, { $push: { pagos: pagoGuardado._id } });
            res.status(201).json({ message: "Pago creado exitosamente", pago: pagoGuardado, success: true });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Error al crear el pago", error: error.message });
        }
    }

}

module.exports = gestionPagosController