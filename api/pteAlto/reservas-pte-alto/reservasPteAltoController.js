const ReservasPteAlto = require('./reservasPteAlto');
const EspaciosDeportivosPteAlto = require('../espacios-deportivos/espaciosDeportivosPteAlto');
const TalleresDeportivosPteAlto = require('../talleres-deportivos/talleresDeportivosPteAlto');
const UsuariosPteAlto = require('../usuarios-pte-alto/usuariosPteAlto');
const sendEmailReservaPteAlto = require('../email-pte-alto/emailReservaPteAlto');

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Verifica la disponibilidad de un espacio en un rango de fechas
 * @param {String} espacioId - ID del espacio deportivo
 * @param {Date} fechaInicio - Fecha de inicio del rango
 * @param {Date} fechaFin - Fecha de fin del rango
 * @returns {Object} - { disponible: boolean, conflictos: [] }
 */
const verificarDisponibilidadEspacio = async (espacioId, fechaInicio, fechaFin) => {
    const conflictos = [];

    // Verificar que el espacio existe y está activo
    const espacio = await EspaciosDeportivosPteAlto.findById(espacioId);
    if (!espacio) {
        return { disponible: false, conflictos: [{ tipo: 'error', mensaje: 'Espacio no encontrado' }] };
    }

    if (!espacio.status) {
        return { disponible: false, conflictos: [{ tipo: 'error', mensaje: 'Espacio deshabilitado' }] };
    }

    // Buscar reservas activas que se solapen con el rango
    const reservasConflictivas = await ReservasPteAlto.find({
        espacioDeportivo: espacioId,
        estado: 'activa',
        $or: [
            // Reserva empieza antes pero termina dentro del rango
            { fechaInicio: { $lt: fechaFin }, fechaFin: { $gt: fechaInicio } },
            // Reserva está completamente dentro del rango
            { fechaInicio: { $gte: fechaInicio }, fechaFin: { $lte: fechaFin } },
            // Reserva contiene completamente el rango
            { fechaInicio: { $lte: fechaInicio }, fechaFin: { $gte: fechaFin } }
        ]
    }).populate('usuario', 'nombre apellido');

    reservasConflictivas.forEach(reserva => {
        conflictos.push({
            tipo: 'reserva',
            id: reserva._id,
            fechaInicio: reserva.fechaInicio,
            fechaFin: reserva.fechaFin,
            nombre: reserva.usuario ? `${reserva.usuario.nombre} ${reserva.usuario.apellido}` : 'Reserva'
        });
    });

    // Buscar talleres activos asignados al espacio que se solapen
    const talleresConflictivos = await TalleresDeportivosPteAlto.find({
        espacioDeportivo: espacioId,
        status: true,
        $or: [
            { fechaInicio: { $lt: fechaFin }, fechaFin: { $gt: fechaInicio } },
            { fechaInicio: { $gte: fechaInicio }, fechaFin: { $lte: fechaFin } },
            { fechaInicio: { $lte: fechaInicio }, fechaFin: { $gte: fechaFin } }
        ]
    });

    talleresConflictivos.forEach(taller => {
        conflictos.push({
            tipo: 'taller',
            id: taller._id,
            fechaInicio: taller.fechaInicio,
            fechaFin: taller.fechaFin,
            nombre: taller.nombre
        });
    });

    return {
        disponible: conflictos.length === 0,
        conflictos
    };
};

/**
 * Obtiene los horarios ocupados de un espacio en un rango de fechas
 * @param {String} espacioId - ID del espacio deportivo
 * @param {Date} fechaInicio - Fecha de inicio
 * @param {Date} fechaFin - Fecha de fin
 * @returns {Array} - Array de objetos con información de ocupación
 */
const obtenerHorariosOcupados = async (espacioId, fechaInicio, fechaFin) => {
    const ocupados = [];

    // Obtener reservas activas
    const reservas = await ReservasPteAlto.find({
        espacioDeportivo: espacioId,
        estado: 'activa',
        fechaInicio: { $gte: fechaInicio },
        fechaFin: { $lte: fechaFin }
    }).populate('usuario', 'nombre apellido');

    reservas.forEach(reserva => {
        ocupados.push({
            fechaInicio: reserva.fechaInicio,
            fechaFin: reserva.fechaFin,
            tipo: 'reserva',
            id: reserva._id,
            nombre: reserva.usuario ? `${reserva.usuario.nombre} ${reserva.usuario.apellido}` : 'Reserva'
        });
    });

    // Obtener talleres activos
    const talleres = await TalleresDeportivosPteAlto.find({
        espacioDeportivo: espacioId,
        status: true,
        fechaInicio: { $gte: fechaInicio },
        fechaFin: { $lte: fechaFin }
    });

    talleres.forEach(taller => {
        ocupados.push({
            fechaInicio: taller.fechaInicio,
            fechaFin: taller.fechaFin,
            tipo: 'taller',
            id: taller._id,
            nombre: taller.nombre
        });
    });

    return ocupados;
};

// ============================================
// CONTROLADOR
// ============================================

const reservasPteAltoController = {

    // ============================================
    // CONSULTA DE DISPONIBILIDAD
    // ============================================

    /**
     * Consultar disponibilidad por deporte
     * GET /reservas-pte-alto/disponibilidad-por-deporte?deporte=futbol&fechaInicio=2025-01-15&fechaFin=2025-01-30
     */
    consultarDisponibilidadPorDeporte: async (req, res) => {
        try {
            const { deporte, fechaInicio, fechaFin } = req.query;

            if (!deporte) {
                return res.status(400).json({
                    success: false,
                    message: "El parámetro 'deporte' es requerido"
                });
            }

            const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
            const fin = fechaFin ? new Date(fechaFin) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 días

            // Buscar espacios con el deporte especificado y activos
            const espacios = await EspaciosDeportivosPteAlto.find({
                deporte: deporte,
                status: true
            }).populate('complejoDeportivo', 'nombre');

            const espaciosConDisponibilidad = await Promise.all(
                espacios.map(async (espacio) => {
                    const ocupados = await obtenerHorariosOcupados(espacio._id, inicio, fin);
                    const total = Math.ceil((fin - inicio) / (60 * 60 * 1000)); // Total de horas en el rango

                    return {
                        id: espacio._id,
                        nombre: espacio.nombre,
                        descripcion: espacio.descripcion,
                        deporte: espacio.deporte,
                        complejoDeportivo: espacio.complejoDeportivo,
                        disponibilidad: {
                            total: total,
                            ocupados: ocupados.length,
                            disponibles: total - ocupados.length,
                            porcentaje: total > 0 ? ((total - ocupados.length) / total * 100).toFixed(2) : 0
                        },
                        proximosDisponibles: ocupados.length < total ? [{
                            fecha: inicio,
                            horarios: []
                        }] : []
                    };
                })
            );

            res.status(200).json({
                success: true,
                espacios: espaciosConDisponibilidad
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Error al consultar disponibilidad por deporte",
                error: error.message
            });
        }
    },

    /**
     * Consultar disponibilidad por fecha específica
     * GET /reservas-pte-alto/disponibilidad-por-fecha?fecha=2025-01-15&deporte=futbol&complejoDeportivo=ObjectId
     */
    consultarDisponibilidadPorFecha: async (req, res) => {
        try {
            const { fecha, deporte, complejoDeportivo } = req.query;

            if (!fecha) {
                return res.status(400).json({
                    success: false,
                    message: "El parámetro 'fecha' es requerido"
                });
            }

            const fechaConsulta = new Date(fecha);
            const inicioDia = new Date(fechaConsulta.setHours(0, 0, 0, 0));
            const finDia = new Date(fechaConsulta.setHours(23, 59, 59, 999));

            // Construir query de filtros
            const filtros = { status: true };
            if (deporte) filtros.deporte = deporte;
            if (complejoDeportivo) filtros.complejoDeportivo = complejoDeportivo;

            const espacios = await EspaciosDeportivosPteAlto.find(filtros)
                .populate('complejoDeportivo', 'nombre');

            const espaciosConSlots = await Promise.all(
                espacios.map(async (espacio) => {
                    const ocupados = await obtenerHorariosOcupados(espacio._id, inicioDia, finDia);

                    // Calcular slots disponibles (cada hora)
                    const slotsDisponibles = [];
                    const horarioApertura = espacio.horarioApertura || '08:00';
                    const horarioCierre = espacio.horarioCierre || '22:00';

                    const [horaApertura, minutoApertura] = horarioApertura.split(':').map(Number);
                    const [horaCierre, minutoCierre] = horarioCierre.split(':').map(Number);

                    for (let hora = horaApertura; hora < horaCierre; hora++) {
                        const slotInicio = new Date(inicioDia);
                        slotInicio.setHours(hora, 0, 0, 0);
                        const slotFin = new Date(inicioDia);
                        slotFin.setHours(hora + 1, 0, 0, 0);

                        // Verificar si el slot está ocupado
                        const estaOcupado = ocupados.some(ocupado => {
                            return (slotInicio >= ocupado.fechaInicio && slotInicio < ocupado.fechaFin) ||
                                (slotFin > ocupado.fechaInicio && slotFin <= ocupado.fechaFin) ||
                                (slotInicio <= ocupado.fechaInicio && slotFin >= ocupado.fechaFin);
                        });

                        slotsDisponibles.push({
                            inicio: `${hora.toString().padStart(2, '0')}:00`,
                            fin: `${(hora + 1).toString().padStart(2, '0')}:00`,
                            disponible: !estaOcupado
                        });
                    }

                    return {
                        id: espacio._id,
                        nombre: espacio.nombre,
                        deporte: espacio.deporte,
                        slotsDisponibles,
                        horariosOcupados: ocupados.map(ocupado => ({
                            inicio: ocupado.fechaInicio.toISOString(),
                            fin: ocupado.fechaFin.toISOString(),
                            tipo: ocupado.tipo,
                            nombre: ocupado.nombre
                        }))
                    };
                })
            );

            res.status(200).json({
                success: true,
                fecha: fecha,
                espacios: espaciosConSlots
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Error al consultar disponibilidad por fecha",
                error: error.message
            });
        }
    },

    /**
     * Verificar disponibilidad de un rango específico
     * GET /reservas-pte-alto/verificar-disponibilidad?espacioDeportivo=ObjectId&fechaInicio=2025-01-15T10:00:00Z&fechaFin=2025-01-15T12:00:00Z
     */
    verificarDisponibilidadRango: async (req, res) => {
        try {
            const { espacioDeportivo, fechaInicio, fechaFin } = req.query;

            if (!espacioDeportivo || !fechaInicio || !fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: "Los parámetros 'espacioDeportivo', 'fechaInicio' y 'fechaFin' son requeridos"
                });
            }

            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);

            if (inicio >= fin) {
                return res.status(400).json({
                    success: false,
                    message: "La fecha de inicio debe ser anterior a la fecha de fin"
                });
            }

            const disponibilidad = await verificarDisponibilidadEspacio(espacioDeportivo, inicio, fin);

            res.status(200).json({
                success: true,
                disponible: disponibilidad.disponible,
                espacioDeportivo: espacioDeportivo,
                fechaInicio: inicio,
                fechaFin: fin,
                conflictos: disponibilidad.conflictos
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Error al verificar disponibilidad",
                error: error.message
            });
        }
    },

    // ============================================
    // CREAR RESERVAS
    // ============================================

    /**
     * Crear reserva de espacio deportivo
     * POST /reservas-pte-alto/crear-reserva-espacio
     * Body: { espacioDeportivo, fechaInicio, fechaFin, notas? }
     */
    crearReservaEspacio: async (req, res) => {
        try {
            const { espacioDeportivo, fechaInicio, fechaFin, notas, usuario } = req.body;
            //  const usuarioId = req.user?.id || req.user?.userId; // Del token JWT

            console.log('Body recibido:', req.body);

            // Validar campos requeridos
            if (!espacioDeportivo || !fechaInicio || !fechaFin || !usuario) {
                return res.status(400).json({
                    success: false,
                    message: "Los campos 'espacioDeportivo', 'fechaInicio', 'fechaFin' y 'usuario' son requeridos"
                });
            }

            // Verificar que el usuario existe
            const usuarioEncontrado = await UsuariosPteAlto.findById(usuario);
            if (!usuarioEncontrado) {
                return res.status(404).json({
                    success: false,
                    message: "Usuario no encontrado"
                });
            }

            // Verificar que el usuario está validado (opcional, descomentar si es requerido)
            // if (usuarioEncontrado.estadoValidacion !== 'validado') {
            //     return res.status(403).json({ 
            //         success: false,
            //         message: "Usuario no validado. Debe esperar la validación de un administrador" 
            //     });
            // }

            // Verificar que el espacio existe y está activo
            const espacio = await EspaciosDeportivosPteAlto.findById(espacioDeportivo);
            if (!espacio) {
                return res.status(404).json({
                    success: false,
                    message: "Espacio deportivo no encontrado"
                });
            }

            // if (!espacio.status) {
            //     return res.status(400).json({ 
            //         success: false,
            //         message: "El espacio deportivo está deshabilitado" 
            //     });
            // }

            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);

            // Validar que las fechas sean válidas
            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Las fechas proporcionadas no son válidas"
                });
            }

            if (inicio >= fin) {
                return res.status(400).json({
                    success: false,
                    message: "La fecha de inicio debe ser anterior a la fecha de fin"
                });
            }

            // Permitir reservas con al menos 5 minutos de anticipación
            const ahora = new Date();
            const cincoMinutos = 5 * 60 * 1000;
            if (inicio.getTime() < (ahora.getTime() + cincoMinutos)) {
                return res.status(400).json({
                    success: false,
                    message: "No se pueden crear reservas con menos de 5 minutos de anticipación"
                });
            }

            // Verificar disponibilidad
            const disponibilidad = await verificarDisponibilidadEspacio(espacioDeportivo, inicio, fin);

            if (!disponibilidad.disponible) {
                return res.status(409).json({
                    success: false,
                    message: "El espacio no está disponible en el rango solicitado",
                    conflictos: disponibilidad.conflictos
                });
            }

            // Crear la reserva - usar el ID del usuario, no el objeto completo
            const nuevaReserva = new ReservasPteAlto({
                usuario: usuario, // Usar el ID directamente del body
                espacioDeportivo: espacioDeportivo,
                fechaInicio: inicio,
                fechaFin: fin,
                tipoReserva: 'espacio',
                estado: 'activa',
                notas: notas || null
            });

            await nuevaReserva.save();

            // Populate para respuesta
            await nuevaReserva.populate('usuario', 'nombre apellido email');
            await nuevaReserva.populate('espacioDeportivo', 'nombre deporte');
            console.log('Reserva creada exitosamente:', nuevaReserva);

            // Enviar email de confirmación de reserva
            try {
                if (nuevaReserva.usuario && nuevaReserva.usuario.email) {
                    const nombreUsuario = nuevaReserva.usuario.nombre 
                        ? `${nuevaReserva.usuario.nombre} ${nuevaReserva.usuario.apellido || ''}`.trim()
                        : 'Usuario';
                    await sendEmailReservaPteAlto(
                        nuevaReserva.usuario.email,
                        nombreUsuario,
                        nuevaReserva
                    );
                }
            } catch (emailError) {
                console.error('Error al enviar email de reserva (no crítico):', emailError);
                // No falla la creación de la reserva si el email falla
            }

            res.status(201).json({
                success: true,
                message: "Reserva creada correctamente",
                reserva: nuevaReserva
            });


        } catch (error) {
            console.error('Error al crear la reserva:', error);
            res.status(500).json({
                success: false,
                message: "Error al crear la reserva",
                error: error.message
            });
        }
    },

    /**
     * Inscribirse en un taller
     * POST /reservas-pte-alto/inscribirse-taller
     * Body: { taller }
     */
    inscribirseEnTaller: async (req, res) => {
        try {
            const { taller, usuario } = req.body;

            if (!taller) {
                return res.status(400).json({
                    success: false,
                    message: "El campo 'taller' es requerido"
                });
            }


            // Verificar que el usuario existe y está validado
            const usuarioEncontrado = await UsuariosPteAlto.findById(usuario);
            if (!usuarioEncontrado) {
                return res.status(404).json({
                    success: false,
                    message: "Usuario no encontrado"
                });
            }

            if (usuario.estadoValidacion !== 'validado') {
                return res.status(403).json({
                    success: false,
                    message: "Usuario no validado. Debe esperar la validación de un administrador"
                });
            }

            // Verificar que el taller existe y está activo
            const tallerDoc = await TalleresDeportivosPteAlto.findById(taller);
            if (!tallerDoc) {
                return res.status(404).json({
                    success: false,
                    message: "Taller no encontrado"
                });
            }

            if (!tallerDoc.status) {
                return res.status(400).json({
                    success: false,
                    message: "El taller está deshabilitado"
                });
            }

            if (!tallerDoc.fechaInicio || !tallerDoc.fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: "El taller no tiene fechas definidas"
                });
            }

            // Verificar que el usuario no está ya inscrito
            if (tallerDoc.usuarios && tallerDoc.usuarios.includes(usuarioEncontrado._id)) {
                return res.status(409).json({
                    success: false,
                    message: "Ya estás inscrito en este taller"
                });
            }

            // Verificar capacidad del taller (si tiene límite)
            if (tallerDoc.capacidad && tallerDoc.usuarios && tallerDoc.usuarios.length >= tallerDoc.capacidad) {
                return res.status(409).json({
                    success: false,
                    message: "El taller ha alcanzado su capacidad máxima"
                });
            }

            // Si el taller está asignado a un espacio, verificar disponibilidad (aunque debería estar bloqueado)
            if (tallerDoc.espacioDeportivo) {
                const disponibilidad = await verificarDisponibilidadEspacio(
                    tallerDoc.espacioDeportivo,
                    tallerDoc.fechaInicio,
                    tallerDoc.fechaFin
                );

                // Si hay conflictos que no sean el mismo taller, retornar error
                const conflictosExternos = disponibilidad.conflictos.filter(
                    conflicto => conflicto.tipo !== 'taller' || conflicto.id.toString() !== tallerDoc._id.toString()
                );

                if (conflictosExternos.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: "El espacio del taller tiene conflictos",
                        conflictos: conflictosExternos
                    });
                }
            }

            // Crear la reserva
            const nuevaReserva = new ReservasPteAlto({
                usuario: usuarioEncontrado?._id,
                taller: tallerDoc._id,
                espacioDeportivo: tallerDoc.espacioDeportivo || null,
                fechaInicio: tallerDoc.fechaInicio,
                fechaFin: tallerDoc.fechaFin,
                tipoReserva: 'taller',
                estado: 'activa'
            });

            await nuevaReserva.save();

            // Agregar usuario al array de usuarios del taller
            if (!tallerDoc.usuarios) {
                tallerDoc.usuarios = [];
            }
            tallerDoc.usuarios.push(usuarioEncontrado._id);
            await tallerDoc.save();

            // Populate para respuesta
            await nuevaReserva.populate('usuario', 'nombre apellido email');
            await nuevaReserva.populate('taller', 'nombre fechaInicio fechaFin');
            await nuevaReserva.populate('espacioDeportivo', 'nombre deporte');

            // Enviar email de confirmación de reserva
            try {
                if (nuevaReserva.usuario && nuevaReserva.usuario.email) {
                    const nombreUsuario = nuevaReserva.usuario.nombre 
                        ? `${nuevaReserva.usuario.nombre} ${nuevaReserva.usuario.apellido || ''}`.trim()
                        : 'Usuario';
                    await sendEmailReservaPteAlto(
                        nuevaReserva.usuario.email,
                        nombreUsuario,
                        nuevaReserva
                    );
                }
            } catch (emailError) {
                console.error('Error al enviar email de reserva (no crítico):', emailError);
                // No falla la inscripción si el email falla
            }

            res.status(201).json({
                success: true,
                message: "Inscripción al taller realizada correctamente",
                reserva: nuevaReserva
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Error al inscribirse en el taller",
                error: error.message
            });
        }
    },

    // ============================================
    // CONSULTAR RESERVAS DEL USUARIO
    // ============================================

    /**
     * Listar reservas del usuario autenticado
     * GET /reservas-pte-alto/mis-reservas?estado=activa&tipoReserva=espacio&fechaDesde=2025-01-01
     */
    misReservas: async (req, res) => {
        try {
            const usuarioId = req.user?.id || req.user?.userId;

            if (!usuarioId) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const { estado, tipoReserva, fechaDesde, fechaHasta } = req.query;

            // Construir query
            const query = { usuario: usuarioId };

            if (estado) {
                query.estado = estado;
            }

            if (tipoReserva) {
                query.tipoReserva = tipoReserva;
            }

            if (fechaDesde || fechaHasta) {
                query.fechaInicio = {};
                if (fechaDesde) {
                    query.fechaInicio.$gte = new Date(fechaDesde);
                }
                if (fechaHasta) {
                    query.fechaInicio.$lte = new Date(fechaHasta);
                }
            }

            const reservas = await ReservasPteAlto.find(query)
                .populate('espacioDeportivo', 'nombre deporte')
                .populate('taller', 'nombre fechaInicio fechaFin')
                .sort({ fechaInicio: -1 });

            res.status(200).json({
                success: true,
                reservas: reservas,
                total: reservas.length
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Error al obtener las reservas",
                error: error.message
            });
        }
    },

    // ============================================
    // CANCELAR RESERVA
    // ============================================

    /**
     * Cancelar reserva (usuario)
     * PUT /reservas-pte-alto/:id/cancelar
     * Body: { motivoCancelacion? }
     */
    cancelarReserva: async (req, res) => {
        try {
            const { id } = req.params;
            const { motivoCancelacion } = req.body;
            const usuarioId = req.user?.id || req.user?.userId;

            if (!usuarioId) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const reserva = await ReservasPteAlto.findById(id);

            if (!reserva) {
                return res.status(404).json({
                    success: false,
                    message: "Reserva no encontrada"
                });
            }

            // Verificar que la reserva pertenece al usuario
            if (reserva.usuario.toString() !== usuarioId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para cancelar esta reserva"
                });
            }

            // Verificar que la reserva está activa
            if (reserva.estado !== 'activa') {
                return res.status(400).json({
                    success: false,
                    message: "La reserva ya está cancelada"
                });
            }

            // Opcional: Validar que no se cancela muy cerca de la fecha (máximo 2 horas antes)
            const ahora = new Date();
            const tiempoRestante = reserva.fechaInicio - ahora;
            const dosHoras = 2 * 60 * 60 * 1000;

            if (tiempoRestante < dosHoras && tiempoRestante > 0) {
                return res.status(400).json({
                    success: false,
                    message: "No se puede cancelar una reserva con menos de 2 horas de anticipación"
                });
            }

            // Cancelar la reserva
            reserva.estado = 'cancelada';
            reserva.canceladoPor = 'USER';
            if (motivoCancelacion) {
                reserva.notas = motivoCancelacion;
            }
            await reserva.save();

            // Si es reserva de taller, remover usuario del array
            if (reserva.tipoReserva === 'taller' && reserva.taller) {
                const taller = await TalleresDeportivosPteAlto.findById(reserva.taller);
                if (taller && taller.usuarios) {
                    taller.usuarios = taller.usuarios.filter(
                        userId => userId.toString() !== usuarioId.toString()
                    );
                    await taller.save();
                }
            }

            await reserva.populate('espacioDeportivo', 'nombre deporte');
            await reserva.populate('taller', 'nombre');
            await reserva.populate('usuario', 'nombre apellido');

            res.status(200).json({
                success: true,
                message: "Reserva cancelada correctamente",
                reserva: reserva
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Error al cancelar la reserva",
                error: error.message
            });
        }
    },

    // ============================================
    // ADMINISTRACIÓN (ADMIN)
    // ============================================

    /**
     * Listar todas las reservas (admin)
     * GET /reservas-pte-alto/admin/todas?espacioDeportivo=ObjectId&estado=activa&tipoReserva=espacio
     */
    listarTodasReservas: async (req, res) => {
        try {
            const {
                espacioDeportivo,
                taller,
                usuario,
                estado,
                tipoReserva,
                fechaDesde,
                fechaHasta
            } = req.query;

            // Construir query
            const query = {};

            if (espacioDeportivo) query.espacioDeportivo = espacioDeportivo;
            if (taller) query.taller = taller;
            if (usuario) query.usuario = usuario;
            if (estado) query.estado = estado;
            if (tipoReserva) query.tipoReserva = tipoReserva;

            if (fechaDesde || fechaHasta) {
                query.fechaInicio = {};
                if (fechaDesde) query.fechaInicio.$gte = new Date(fechaDesde);
                if (fechaHasta) query.fechaInicio.$lte = new Date(fechaHasta);
            }

            const reservas = await ReservasPteAlto.find(query)
                .populate({
                    path: 'usuario',
                    select: 'nombre apellido email',
                    model: UsuariosPteAlto
                })
                .populate({
                    path: 'espacioDeportivo',
                    select: 'nombre deporte',
                    model: EspaciosDeportivosPteAlto
                })
                .populate({
                    path: 'taller',
                    select: 'nombre fechaInicio fechaFin',
                    model: TalleresDeportivosPteAlto
                })
                .populate({
                    path:'reservadoPor',
                    select: 'nombre apellido email',
                    model: UsuariosPteAlto
                })
                .sort({ fechaInicio: -1 });

            res.status(200).json({
                success: true,
                reservas: reservas,
                total: reservas.length
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Error al obtener las reservas",
                error: error.message
            });
        }
    },

    /**
     * Obtener reserva por ID (admin)
     * GET /reservas-pte-alto/admin/:id
     */
    obtenerReservaPorId: async (req, res) => {
        try {
            const { id } = req.params;

            const reserva = await ReservasPteAlto.findById(id)
                .populate('usuario', 'nombre apellido email rut telefono')
                .populate('espacioDeportivo', 'nombre deporte direccion')
                .populate('taller', 'nombre descripcion fechaInicio fechaFin capacidad');

            if (!reserva) {
                return res.status(404).json({
                    success: false,
                    message: "Reserva no encontrada"
                });
            }

            res.status(200).json({
                success: true,
                reserva: reserva
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Error al obtener la reserva",
                error: error.message
            });
        }
    },

    /**
     * Cancelar reserva (admin)
     * PUT /reservas-pte-alto/admin/:id/cancelar
     * Body: { motivoCancelacion? }
     */
    cancelarReservaAdmin: async (req, res) => {
        try {
            const { id } = req.params;
            const { motivoCancelacion } = req.body;

            const reserva = await ReservasPteAlto.findById(id);

            if (!reserva) {
                return res.status(404).json({
                    success: false,
                    message: "Reserva no encontrada"
                });
            }

            if (reserva.estado !== 'activa') {
                return res.status(400).json({
                    success: false,
                    message: "La reserva ya está cancelada"
                });
            }

            // Cancelar la reserva
            reserva.estado = 'cancelada';
            reserva.canceladoPor = 'ADMIN';
            if (motivoCancelacion) {
                reserva.notas = motivoCancelacion;
            }
            await reserva.save();

            // Si es reserva de taller, remover usuario del array
            if (reserva.tipoReserva === 'taller' && reserva.taller) {
                const taller = await TalleresDeportivosPteAlto.findById(reserva.taller);
                if (taller && taller.usuarios) {
                    taller.usuarios = taller.usuarios.filter(
                        userId => userId.toString() !== reserva.usuario.toString()
                    );
                    await taller.save();
                }
            }

            await reserva.populate('usuario', 'nombre apellido email');
            await reserva.populate('espacioDeportivo', 'nombre deporte');
            await reserva.populate('taller', 'nombre');

            res.status(200).json({
                success: true,
                message: "Reserva cancelada correctamente por administrador",
                reserva: reserva
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Error al cancelar la reserva",
                error: error.message
            });
        }
    },

    // ============================================
    // RESERVAS INTERNAS (ADMIN)
    // ============================================

    /**
     * Obtener complejo con espacios deportivos y horarios disponibles
     * GET /reservas-pte-alto/admin/complejo/:complejoId/espacios-disponibles?fechaInicio=2025-01-15&fechaFin=2025-01-20
     */
    obtenerComplejoConEspaciosDisponibles: async (req, res) => {
        try {
            const { complejoId } = req.params;
            const { fechaInicio, fechaFin } = req.query;

            const ComplejosDeportivosPteAlto = require('../complejos-deportivos/complejosDeportivosPteAlto');
            const EspaciosDeportivosPteAlto = require('../espacios-deportivos/espaciosDeportivosPteAlto');

            // Obtener el complejo
            const complejo = await ComplejosDeportivosPteAlto.findById(complejoId)
                .populate('espaciosDeportivos');

            if (!complejo) {
                return res.status(404).json({
                    success: false,
                    message: "Complejo deportivo no encontrado"
                });
            }

            // Obtener todos los espacios del complejo
            const espacios = await EspaciosDeportivosPteAlto.find({
                complejoDeportivo: complejoId,
                status: { $in: ['activo', 'interno'] } // Solo espacios activos o internos
            });

            // Si hay fechas, calcular horarios disponibles
            let espaciosConDisponibilidad = espacios;
            if (fechaInicio && fechaFin) {
                const inicio = new Date(fechaInicio);
                const fin = new Date(fechaFin);

                espaciosConDisponibilidad = await Promise.all(
                    espacios.map(async (espacio) => {
                        const ocupados = await obtenerHorariosOcupados(espacio._id, inicio, fin);
                        
                        // Calcular slots disponibles por día
                        const slotsPorDia = [];
                        const fechaActual = new Date(inicio);
                        
                        while (fechaActual <= fin) {
                            const inicioDia = new Date(fechaActual);
                            inicioDia.setHours(0, 0, 0, 0);
                            const finDia = new Date(fechaActual);
                            finDia.setHours(23, 59, 59, 999);

                            const ocupadosDia = ocupados.filter(ocupado => {
                                const inicioOcupado = new Date(ocupado.fechaInicio);
                                const finOcupado = new Date(ocupado.fechaFin);
                                return inicioOcupado >= inicioDia && finOcupado <= finDia;
                            });

                            const horarioApertura = espacio.horarioApertura || '08:00';
                            const horarioCierre = espacio.horarioCierre || '22:00';
                            const [horaApertura] = horarioApertura.split(':').map(Number);
                            const [horaCierre] = horarioCierre.split(':').map(Number);

                            const slotsDisponibles = [];
                            for (let hora = horaApertura; hora < horaCierre; hora++) {
                                const slotInicio = new Date(inicioDia);
                                slotInicio.setHours(hora, 0, 0, 0);
                                const slotFin = new Date(inicioDia);
                                slotFin.setHours(hora + 1, 0, 0, 0);

                                const estaOcupado = ocupadosDia.some(ocupado => {
                                    const inicioOcupado = new Date(ocupado.fechaInicio);
                                    const finOcupado = new Date(ocupado.fechaFin);
                                    return (slotInicio >= inicioOcupado && slotInicio < finOcupado) ||
                                        (slotFin > inicioOcupado && slotFin <= finOcupado) ||
                                        (slotInicio <= inicioOcupado && slotFin >= finOcupado);
                                });

                                slotsDisponibles.push({
                                    inicio: `${hora.toString().padStart(2, '0')}:00`,
                                    fin: `${(hora + 1).toString().padStart(2, '0')}:00`,
                                    disponible: !estaOcupado
                                });
                            }

                            slotsPorDia.push({
                                fecha: new Date(fechaActual),
                                slots: slotsDisponibles
                            });

                            fechaActual.setDate(fechaActual.getDate() + 1);
                        }

                        return {
                            ...espacio.toObject(),
                            horariosDisponibles: slotsPorDia
                        };
                    })
                );
            }

            res.status(200).json({
                success: true,
                complejo: {
                    _id: complejo._id,
                    nombre: complejo.nombre,
                    descripcion: complejo.descripcion,
                    direccion: complejo.direccion,
                    horarioApertura: complejo.horarioApertura,
                    horarioCierre: complejo.horarioCierre
                },
                espacios: espaciosConDisponibilidad
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Error al obtener complejo con espacios disponibles",
                error: error.message
            });
        }
    },

    /**
     * Crear reserva interna (individual o bloque)
     * POST /reservas-pte-alto/admin/crear-reserva-interna
     * Body: { 
     *   espaciosDeportivos: [ObjectId] o espacioDeportivo: ObjectId,
     *   fechaInicio, fechaFin, 
     *   tipoReservaInterna: 'tercero' | 'convenio' | 'cliente' | 'arrendatario' | 'mantenimiento',
     *   reservadoPor: ObjectId (admin),
     *   reservadoPara: String,
     *   notas?: String
     * }
     */
    crearReservaInterna: async (req, res) => {
        try {
            const {
                espaciosDeportivos, // Array para bloque
                espacioDeportivo, // Individual
                fechaInicio,
                fechaFin,
                tipoReservaInterna,
                reservadoPor,
                reservadoPara,
                usuario, // Campo usuario cuando tipoReservaInterna es 'usuario'
                notas
            } = req.body;

            // Validar campos requeridos
            if (!fechaInicio || !fechaFin || !tipoReservaInterna || !reservadoPor || !reservadoPara) {
                return res.status(400).json({
                    success: false,
                    message: "Los campos 'fechaInicio', 'fechaFin', 'tipoReservaInterna', 'reservadoPor' y 'reservadoPara' son requeridos"
                });
            }

            // Validar que se proporcione al menos un espacio
            if (!espaciosDeportivos && !espacioDeportivo) {
                return res.status(400).json({
                    success: false,
                    message: "Debe proporcionar 'espaciosDeportivos' (array) o 'espacioDeportivo' (individual)"
                });
            }

            // Validar tipo de reserva interna
            const tiposValidos = ['usuario', 'tercero', 'convenio', 'cliente', 'arrendatario', 'mantenimiento'];
            if (!tiposValidos.includes(tipoReservaInterna)) {
                return res.status(400).json({
                    success: false,
                    message: `tipoReservaInterna debe ser uno de: ${tiposValidos.join(', ')}`
                });
            }

            // Si es tipo 'usuario', validar que se proporcione el campo usuario
            if (tipoReservaInterna === 'usuario' && !usuario) {
                return res.status(400).json({
                    success: false,
                    message: "El campo 'usuario' es requerido cuando tipoReservaInterna es 'usuario'"
                });
            }

            // Si se proporciona usuario, verificar que existe
            let usuarioEncontrado = null;
            if (usuario) {
                usuarioEncontrado = await UsuariosPteAlto.findById(usuario);
                if (!usuarioEncontrado) {
                    return res.status(404).json({
                        success: false,
                        message: "Usuario no encontrado"
                    });
                }
            }

            // Verificar que el usuario admin existe
            const usuarioAdmin = await UsuariosPteAlto.findById(reservadoPor);
            if (!usuarioAdmin) {
                return res.status(404).json({
                    success: false,
                    message: "Usuario administrador no encontrado"
                });
            }

            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);

            // Validar fechas
            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Las fechas proporcionadas no son válidas"
                });
            }

            if (inicio >= fin) {
                return res.status(400).json({
                    success: false,
                    message: "La fecha de inicio debe ser anterior a la fecha de fin"
                });
            }

            // Determinar espacios a reservar
            const espaciosAReservar = espaciosDeportivos || [espacioDeportivo];

            // Verificar disponibilidad y crear reservas
            const reservasCreadas = [];
            const errores = [];

            for (const espacioId of espaciosAReservar) {
                // Verificar que el espacio existe
                const espacio = await EspaciosDeportivosPteAlto.findById(espacioId);
                if (!espacio) {
                    errores.push({
                        espacioId,
                        error: "Espacio no encontrado"
                    });
                    continue;
                }

                // Verificar disponibilidad (excepto para mantenimiento que puede sobrescribir)
                if (tipoReservaInterna !== 'mantenimiento') {
                    const disponibilidad = await verificarDisponibilidadEspacio(espacioId, inicio, fin);
                    if (!disponibilidad.disponible) {
                        errores.push({
                            espacioId,
                            error: "Espacio no disponible",
                            conflictos: disponibilidad.conflictos
                        });
                        continue;
                    }
                }

                // Crear la reserva interna
                const nuevaReserva = new ReservasPteAlto({
                    espacioDeportivo: espacioId,
                    fechaInicio: inicio,
                    fechaFin: fin,
                    tipoReserva: 'espacio',
                    estado: 'activa',
                    esReservaInterna: true,
                    tipoReservaInterna: tipoReservaInterna,
                    reservadoPor: reservadoPor,
                    reservadoPara: reservadoPara,
                    usuario: usuario || null, // Agregar usuario si está presente
                    notas: notas || null
                });

                await nuevaReserva.save();
                await nuevaReserva.populate('espacioDeportivo', 'nombre deporte');
                await nuevaReserva.populate('reservadoPor', 'nombre apellido email');
                
                // Si es tipo 'usuario' y tiene usuario, populate usuario para el email
                if (tipoReservaInterna === 'usuario' && usuario) {
                    await nuevaReserva.populate('usuario', 'nombre apellido email');
                }

                reservasCreadas.push(nuevaReserva);
            }

            if (reservasCreadas.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo crear ninguna reserva",
                    errores
                });
            }

            // Enviar emails de confirmación para reservas tipo 'usuario' con usuario
            if (tipoReservaInterna === 'usuario' && usuario) {
                for (const reserva of reservasCreadas) {
                    try {
                        if (reserva.usuario && reserva.usuario.email) {
                            const nombreUsuario = reserva.usuario.nombre 
                                ? `${reserva.usuario.nombre} ${reserva.usuario.apellido || ''}`.trim()
                                : 'Usuario';
                            await sendEmailReservaPteAlto(
                                reserva.usuario.email,
                                nombreUsuario,
                                reserva
                            );
                        }
                    } catch (emailError) {
                        console.error('Error al enviar email de reserva (no crítico):', emailError);
                        // No falla la creación si el email falla
                    }
                }
            }

            res.status(201).json({
                success: true,
                message: reservasCreadas.length === 1 
                    ? "Reserva interna creada correctamente" 
                    : `${reservasCreadas.length} reservas internas creadas correctamente`,
                reservas: reservasCreadas,
                total: reservasCreadas.length,
                errores: errores.length > 0 ? errores : undefined
            });

        } catch (error) {
            console.error('Error al crear reserva interna:', error);
            res.status(500).json({
                success: false,
                message: "Error al crear la reserva interna",
                error: error.message
            });
        }
    },
    validarReserva: async (req, res) => {
        try {
            const { idReserva } = req.params;
            const reserva = await ReservasPteAlto.findById(idReserva);
            if (!reserva) {
                return res.status(404).json({
                    success: false,
                    message: "Reserva no encontrada"
                });
            }
            res.status(200).json({
                success: true,
                message: "Reserva validada correctamente",
                reserva: reserva
            });
        } catch (error) {
            console.log(error);
        }
    },

    /**
     * Consultar disponibilidad de espacios deportivos para crear talleres
     * POST /reservas-pte-alto/disponibilidad-espacios-taller
     * Body: { 
     *   espaciosDeportivos: [ObjectId], 
     *   fechaInicio: Date, 
     *   fechaFin: Date, 
     *   diasSeleccionados: [0-6] // 0=Domingo, 1=Lunes, etc.
     * }
     * Retorna disponibilidad en bloques de 15 minutos
     */
    consultarDisponibilidadEspaciosTaller: async (req, res) => {
        try {
            const { espaciosDeportivos, fechaInicio, fechaFin, diasSeleccionados } = req.body;

            // Validar campos requeridos
            if (!espaciosDeportivos || !Array.isArray(espaciosDeportivos) || espaciosDeportivos.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "El campo 'espaciosDeportivos' es requerido y debe ser un array con al menos un ID"
                });
            }

            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: "Los campos 'fechaInicio' y 'fechaFin' son requeridos"
                });
            }

            if (!diasSeleccionados || !Array.isArray(diasSeleccionados) || diasSeleccionados.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "El campo 'diasSeleccionados' es requerido y debe ser un array con al menos un día"
                });
            }

            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            inicio.setHours(0, 0, 0, 0);
            fin.setHours(23, 59, 59, 999);

            // Procesar cada espacio deportivo
            const espaciosConDisponibilidad = await Promise.all(
                espaciosDeportivos.map(async (espacioId) => {
                    // Obtener información del espacio
                    const espacio = await EspaciosDeportivosPteAlto.findById(espacioId);
                    if (!espacio) {
                        return {
                            espacioId,
                            error: "Espacio no encontrado",
                            disponibilidad: []
                        };
                    }

                    // Obtener todas las reservas activas del espacio en el rango de fechas
                    const reservasEspacio = await ReservasPteAlto.find({
                        espacioDeportivo: espacioId,
                        estado: 'activa',
                        $or: [
                            { fechaInicio: { $gte: inicio, $lte: fin } },
                            { fechaFin: { $gte: inicio, $lte: fin } },
                            { fechaInicio: { $lte: inicio }, fechaFin: { $gte: fin } }
                        ]
                    }).lean();

                    // Horarios del espacio (o valores por defecto)
                    const horarioApertura = espacio.horarioApertura || '08:00';
                    const horarioCierre = espacio.horarioCierre || '22:00';
                    const [horaApertura, minutoApertura] = horarioApertura.split(':').map(Number);
                    const [horaCierre, minutoCierre] = horarioCierre.split(':').map(Number);

                    // Generar disponibilidad por día de la semana
                    const disponibilidadPorDia = diasSeleccionados.map(diaSemana => {
                        const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                        
                        // Generar slots de 15 minutos
                        const slots = [];
                        for (let hora = horaApertura; hora < horaCierre; hora++) {
                            for (let minuto = 0; minuto < 60; minuto += 15) {
                                // No generar slots después del cierre
                                if (hora === horaCierre - 1 && minuto + 15 > 60) continue;
                                
                                const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
                                const horaFinMinuto = minuto + 15;
                                const horaFinHora = horaFinMinuto >= 60 ? hora + 1 : hora;
                                const horaFinMinutoAjustado = horaFinMinuto >= 60 ? 0 : horaFinMinuto;
                                const horaFinStr = `${horaFinHora.toString().padStart(2, '0')}:${horaFinMinutoAjustado.toString().padStart(2, '0')}`;

                                // Verificar si este slot está ocupado en alguna fecha del rango para este día de la semana
                                let estaOcupado = false;
                                let motivoOcupacion = null;

                                // Iterar por todas las fechas en el rango que coincidan con este día de la semana
                                const fechaActual = new Date(inicio);
                                while (fechaActual <= fin) {
                                    if (fechaActual.getDay() === diaSemana) {
                                        // Crear fecha/hora del slot
                                        const slotInicio = new Date(fechaActual);
                                        slotInicio.setHours(hora, minuto, 0, 0);
                                        const slotFin = new Date(fechaActual);
                                        slotFin.setHours(horaFinHora, horaFinMinutoAjustado, 0, 0);

                                        // Verificar si hay alguna reserva que se solape con este slot
                                        const reservaConflicto = reservasEspacio.find(reserva => {
                                            const reservaInicio = new Date(reserva.fechaInicio);
                                            const reservaFin = new Date(reserva.fechaFin);
                                            
                                            // Verificar solapamiento
                                            return (slotInicio < reservaFin && slotFin > reservaInicio);
                                        });

                                        if (reservaConflicto) {
                                            estaOcupado = true;
                                            motivoOcupacion = reservaConflicto.reservadoPara || 
                                                (reservaConflicto.tipoReserva === 'taller' ? 'Taller' : 'Reserva');
                                            break;
                                        }
                                    }
                                    fechaActual.setDate(fechaActual.getDate() + 1);
                                }

                                slots.push({
                                    hora: horaStr,
                                    horaFin: horaFinStr,
                                    disponible: !estaOcupado,
                                    motivo: motivoOcupacion
                                });
                            }
                        }

                        return {
                            dia: diaSemana,
                            nombreDia: nombresDias[diaSemana],
                            slots
                        };
                    });

                    return {
                        espacioId: espacio._id,
                        espacioNombre: espacio.nombre,
                        espacioDeporte: espacio.deporte,
                        horarioApertura,
                        horarioCierre,
                        disponibilidadPorDia
                    };
                })
            );

            res.status(200).json({
                success: true,
                fechaInicio: inicio,
                fechaFin: fin,
                diasConsultados: diasSeleccionados,
                espacios: espaciosConDisponibilidad
            });

        } catch (error) {
            console.error('Error al consultar disponibilidad de espacios:', error);
            res.status(500).json({
                success: false,
                message: "Error al consultar disponibilidad de espacios",
                error: error.message
            });
        }
    }
};

module.exports = reservasPteAltoController;
