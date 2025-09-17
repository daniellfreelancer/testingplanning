const Usuarios = require("../usuarios-complejos/usuariosComplejos");
const GestionPagos = require("./gestionPagos");


const populateOptions = [
    { path: 'usuario', select: 'nombre apellido email rut' },
    { path: 'institucion', select: 'nombre' },
    { path: 'recepcion', select: 'nombre apellido email rut' },
    { path: 'planCurso', select: 'tipoPlan plan valor dias ' },
    { path: 'planNL', select: 'tipoPlan plan valor dias' },
    { path: 'planGym', select: 'tipoPlan plan valor dias' },
]

const gestionPagosController = {
    registrarPago: async (req, res) => {

        try {
            const {usuarioID} = req.params

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

    }

}

module.exports = gestionPagosController