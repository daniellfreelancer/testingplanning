const AccesoUsuariosComplejos = require('./accesoUsuariosComplejosModel');

// Populate usuariosComplejos "nombre, apellido, rut, email, tipoPlan, rol, telefono"
// Populate institucion "nombre"
// Populate usuarioAutorizado "nombre, apellido, rut, email, telefono, rol"

const queryPopulate = [
    {
        path: 'usuario usuarioAutorizado',
        select: 'nombre apellido rut email telefono rol tipoPlan tipoPlanGym tipoCurso nivelCurso tipoContratacion arrendatario nombreArrendatario'
    },
    {
        path: 'institucion',
        select: 'nombre'
    },

]

const calcularFechasPorPeriodo = (periodo) => {
    const ahora = new Date();
    const inicio = new Date();
    const fin = new Date();

    switch (periodo) {
        case 'hoy':
            // Desde el inicio del día actual hasta el final del día
            inicio.setHours(0, 0, 0, 0);
            fin.setHours(23, 59, 59, 999);
            break;
        
        case 'semana':
            // Desde el lunes de esta semana hasta el sábado actual
            const diaSemana = ahora.getDay(); // 0 = domingo, 1 = lunes, etc.
            const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1; // Si es domingo, retroceder 6 días
            
            inicio.setDate(ahora.getDate() - diasHastaLunes);
            inicio.setHours(0, 0, 0, 0);
            
            fin.setHours(23, 59, 59, 999);
            break;
        
        case 'mes':
            // Desde el primer día del mes actual hasta el último día del mes
            inicio.setDate(1);
            inicio.setHours(0, 0, 0, 0);
            
            fin.setMonth(ahora.getMonth() + 1, 0); // Último día del mes actual
            fin.setHours(23, 59, 59, 999);
            break;
        
        case 'todos':
            // No aplicar filtro de fecha
            return null;
        
        default:
            // Por defecto, retornar todos los accesos
            return null;
    }

    return { inicio, fin };
};

const AccesoUsuariosComplejosController = {
    crearAccesoUsuariosComplejos: async (req, res) => {
        try {
            const acceso = await AccesoUsuariosComplejos.create(req.body);
            res.status(200).json(acceso);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }

    },
    //obtener los accesos por institucion
    obtenerAccesosPorInstitucion: async (req, res) => {
        try {
            const { institucion, periodo = 'todos' } = req.params;
            
            // Construir el query base
            let query = { institucion };
            
            // Aplicar filtro de fecha si no es 'todos'
            if (periodo !== 'todos') {
                const fechas = calcularFechasPorPeriodo(periodo);
                if (fechas) {
                    query.createdAt = {
                        $gte: fechas.inicio,
                        $lte: fechas.fin
                    };
                }
            }
            
            const accesos = await AccesoUsuariosComplejos.find(query).sort({ createdAt: -1 }).populate(queryPopulate);
            res.status(200).json(accesos);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    //obtener todos los accesos ordenados por fecha de creación
    obtenerTodosLosAccesos: async (req, res) => {
        try {
            const accesos = await AccesoUsuariosComplejos.find().sort({ createdAt: -1 }).populate(queryPopulate);
            res.status(200).json(accesos);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AccesoUsuariosComplejosController;