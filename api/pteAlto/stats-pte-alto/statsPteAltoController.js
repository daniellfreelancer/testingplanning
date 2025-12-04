const ComplejosDeportivosPteAlto = require('../complejos-deportivos/complejosDeportivosPteAlto');
const EspaciosDeportivosPteAlto = require('../espacios-deportivos/espaciosDeportivosPteAlto');
const TalleresDeportivosPteAlto = require('../talleres-deportivos/talleresDeportivosPteAlto');
const UsuariosPteAlto = require('../usuarios-pte-alto/usuariosPteAlto');
const ReservasPteAlto = require('../reservas-pte-alto/reservasPteAlto');

const statsPteAltoController = {

    obtenerStatsPteAlto: async (req, res) => {

        try {
            const ahora = new Date();

            // Estadísticas de usuarios con rol USER
            const totalUsuarios = await UsuariosPteAlto.countDocuments({ rol: 'USER' });
            const usuariosActivos = await UsuariosPteAlto.countDocuments({ rol: 'USER', status: true });
            const usuariosInactivos = await UsuariosPteAlto.countDocuments({ rol: 'USER', status: false });
            const usuariosPorValidar = await UsuariosPteAlto.countDocuments({ rol: 'USER', estadoValidacion: 'pendiente' });

            // Estadísticas de reservas
            const totalReservas = await ReservasPteAlto.countDocuments();
            const reservasProximas = await ReservasPteAlto.countDocuments({
                estado: 'activa',
                fechaInicio: { $gt: ahora }
            });
            const reservasPasadas = await ReservasPteAlto.countDocuments({
                estado: 'activa',
                fechaInicio: { $lt: ahora }
            });
            const reservasCanceladas = await ReservasPteAlto.countDocuments({
                estado: 'cancelada'
            });

            // Estadísticas de complejos deportivos
            const totalComplejos = await ComplejosDeportivosPteAlto.countDocuments();

            // Estadísticas de espacios deportivos
            const totalEspacios = await EspaciosDeportivosPteAlto.countDocuments();

            // Estadísticas de talleres
            const totalTalleres = await TalleresDeportivosPteAlto.countDocuments();

            const stats = {
                usuarios: {
                    total: totalUsuarios,
                    activos: usuariosActivos,
                    inactivos: usuariosInactivos,
                    porValidar: usuariosPorValidar
                },
                reservas: {
                    total: totalReservas,
                    proximas: reservasProximas,
                    pasadas: reservasPasadas,
                    canceladas: reservasCanceladas
                },
                complejosDeportivos: {
                    total: totalComplejos
                },
                espaciosDeportivos: {
                    total: totalEspacios
                },
                talleres: {
                    total: totalTalleres
                }
            };

            res.status(200).json({
                success: true,
                message: "Estadísticas obtenidas correctamente",
                data: stats
            });

        } catch (error) {
            console.error("Error al obtener estadísticas:", error);
            res.status(500).json({
                success: false,
                message: "Error al obtener las estadísticas",
                error: error.message
            });
        }
    }

};


module.exports = statsPteAltoController;
