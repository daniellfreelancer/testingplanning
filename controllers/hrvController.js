const HRV =  require('../models/hrv')



const hrvController = {

    //agregar registro de hrv
    addHRV : async (req, res) => {

        try {

            let newHRV = await new HRV(req.body).save()

            if (newHRV) {
                res.status(200).json({
                    message: "Registro de HRV registrado con éxito",
                    success: true,
                })
            } else {
                res.status(400).json({
                    message: "Error al registrar el HRV",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },
    // obtener todos los registros de hrv
    getHRVs : async (req, res) => {

        try {

            let hrvList = await HRV.find()

            if (hrvList) {
                res.status(200).json({
                    message: "Listado de HRVs",
                    success: true,
                    data: hrvList,
                })
            } else {
                res.status(404).json({
                    message: "No se encontraron HRVs",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },
    // obtener un registro de hrv por id
    getHRVById : async (req, res) => {

        try {

            let hrv = await HRV.findById(req.params.id)

            if (hrv) {
                res.status(200).json({
                    message: "HRV encontrado",
                    success: true,
                    data: hrv,
                })
            } else {
                res.status(404).json({
                    message: "No se encontró el HRV",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },
    // borrar un registro hrv
    deleteHRV : async (req, res) => {

        try {

            let hrv = await HRV.findByIdAndDelete(req.params.id)

            if (hrv) {
                res.status(200).json({
                    message: "HRV eliminado con éxito",
                    success: true,
                })
            } else {
                res.status(404).json({
                    message: "No se encontró el HRV",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },
    getHRVsHistoryByStudentId : async (req, res) => {

        try {

            let hrvList = await HRV.find({ student: req.params.studentId })

            if (hrvList) {
                res.status(200).json({
                    message: "Listado de HRVs del estudiante",
                    success: true,
                    data: hrvList,
                })
            } else {
                res.status(404).json({
                    message: "No se encontraron HRVs para el estudiante",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },
    getHRVsHistoryByUser : async (req, res) => {

        try {

            let hrvList = await HRV.find({ user: req.params.userId })

            if (hrvList) {
                res.status(200).json({
                    message: "Listado de HRVs del usuario",
                    success: true,
                    data: hrvList,
                })
            } else {
                res.status(404).json({
                    message: "No se encontraron HRVs para el usuario",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },
    // obtener los registros historicos de un dispositivo
    getHRVsHistoryByDevice : async (req, res) => {

        try {

            let hrvList = await HRV.find({ device: req.params.macAddress })

            if (hrvList) {
                res.status(200).json({
                    message: "Listado de HRVs del dispositivo",
                    success: true,
                    data: hrvList,
                })
            } else {
                res.status(404).json({
                    message: "No se encontraron HRVs para el dispositivo",
                    success: false,
                })
            }

        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })

        }

    },  
    getHRVNoDuplicates : async (req, res) => {
        try {
            // Pipeline de agregación para obtener los HRV únicos por usuario o estudiante
            const hrvData = await HRV.aggregate([
                // Agrupamos por user y student, seleccionando el último registro por timestamps
                {
                    $group: {
                        _id: {
                            user: "$user",
                            student: "$student",
                        },
                        latestHRV: { $first: "$$ROOT" }, // Obtenemos el documento completo
                        createdAt: { $max: "$createdAt" }, // Aseguramos que sea el más reciente
                    }
                },
                {
                    $replaceRoot: { newRoot: "$latestHRV" } // Reemplazamos el root con el documento completo
                },
                {
                    $sort: { createdAt: -1 } // Ordenamos por fecha descendente
                }
            ]);
    
            res.status(200).json({
                success: true,
                data: hrvData,
            });
        } catch (error) {
            console.error('Error fetching HRV data without duplicates:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching HRV data without duplicates',
                error: error.message,
            });
        }
    },
    getHRVUsersStudent : async (req, res) => {
        try {
        // Obtener todos los registros de HRV y poblar los campos necesarios
        const hrvRecords = await HRV.find()
            .populate('user', 'name lastName age imgUrl size weight') // Población de user
            .populate('student', 'name lastName age imgUrl size weight') // Población de student
            .sort({ createdAt: -1 }); // Ordenar por fecha de creación de forma descendente

            // Usar un objeto para almacenar los registros únicos
            const uniqueHRV = {};
    
            hrvRecords.forEach(record => {
                // Clave única basada en user o student
                const key = record?.user ? record?.user?.toString() : record?.student?.toString();
    
                // Solo agregar si no existe ya en el objeto uniqueHRV
                if (!uniqueHRV[key]) {
                    uniqueHRV[key] = record;
                } else {
                    // Si ya existe, comparar las fechas y mantener el más reciente
                    if (record.createdAt > uniqueHRV[key].createdAt) {
                        uniqueHRV[key] = record;
                    }
                }
            });
    
            // Convertir el objeto a un array
            const result = Object.values(uniqueHRV);
    
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching HRV records:', error);
            return res.status(500).json({ message: 'Error fetching HRV records', error });
        }
    },
    getTodayHRVResults: async (req, res) => {
        try {
          const { userType, date } = req.params;
          
          // 1. Convertir la fecha de cadena a objeto Date
          const targetDate = new Date(date);
          // Verificar si se pudo convertir correctamente
          if (isNaN(targetDate.getTime())) {
            return res.status(400).json({
              message: "Fecha inválida. Formato esperado: YYYY-MM-DDTHH:mm:ss.sssZ",
              success: false,
            });
          }
      
          // 2. Obtener el inicio y fin del día de la fecha proporcionada
        //   const startOfDay = new Date(targetDate);
        //   startOfDay.setUTCHours(0, 0, 0, 0);
      
        //   const endOfDay = new Date(targetDate);
        //   endOfDay.setUTCHours(23, 59, 59, 999);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
    
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
      
          // 3. Construir la query dinámicamente según el userType
          let query = {
            createdAt: {
              $gte: startOfDay,
              $lte: endOfDay
            }
          };
      
          if (userType === "user") {
            query.user = req.params.userId; // Asegúrate de que 'userId' venga en el request
          } else if (userType === "student") {
            query.student = req.params.studentId; // Asegúrate de que 'studentId' venga en el request
          } else {
            return res.status(400).json({
              message: "Tipo de usuario inválido. Solo se acepta 'user' o 'student'",
              success: false,
            });
          }
      
          // 4. Realizar la búsqueda en la colección HRV
          const hrvList = await HRV.find(query);
      
          // 5. Verificar si se encontraron resultados
          if (hrvList && hrvList.length > 0) {
            return res.status(200).json({
              message: "Listado de HRVs para el día especificado",
              success: true,
              data: hrvList,
            });
          } else {
            return res.status(404).json({
              message: "No se encontraron HRVs para el día indicado",
              success: false,
            });
          }
      
        } catch (error) {
          console.error("Error en getTodayHRVResults:", error);
          return res.status(500).json({
            message: "Error interno del servidor",
            success: false,
            error: error.message,
          });
        }
      },
    getLastSevenrRDataByUser : async (req, res) => {

        try {

            let {id, userType} = req.params;

            let hrvList

            if (userType === 'user') {
                hrvList = await HRV.find({ user: id }).sort({ createdAt: -1 }).limit(7);
            } else if (userType === 'student') {
                hrvList = await HRV.find({ student: id }).sort({ createdAt: -1 }).limit(7);
            } else {
                res.status(400).json({
                    message: "Tipo de usuario inválido. Solo se acepta 'user' o'student'",
                    success: false,
                })
                return;
            }

            if (hrvList) {
                res.status(200).json({
                    message: "ultimos 7 HRVs",
                    success: true,
                    data: hrvList,
                })
            } else {
                res.status(404).json({
                    message: "No se encontraron HRVs para el estudiante",
                    success: false,
                })
            }

            
        } catch (error) {

            res.status(500).json({
                message: "Error interno del servidor",
                success: false,
                error: error.message,
            })
            
        }

    }

}

module.exports = hrvController