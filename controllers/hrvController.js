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
                hrvList = await HRV.find({ user: id }).sort({ createdAt: -1 }).limit(28);
            } else if (userType === 'student') {
                hrvList = await HRV.find({ student: id }).sort({ createdAt: -1 }).limit(28);
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

    },
    getHrvListUser : async (req, res) => {
        try {
          // 1. Definir el inicio y fin del día en horario local
          const now = new Date();
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(now);
          endOfDay.setHours(23, 59, 59, 999);
      
          // 2. Buscar todas las mediciones del día actual y ordenar por fecha de creación desc
          const hrvList = await HRV.find({
            createdAt: {
              $gte: startOfDay,
              $lte: endOfDay,
            }
          })
          .sort({ createdAt: -1 }) // Descendente
          .populate('user', 'name lastname imgUrl')
          .populate('student', 'name lastname imgUrl');
      
          /*
            hrvList tendrá todas las mediciones de hoy en orden descendente
            (la más reciente primero).
          */
      
          // 3. Agrupar los registros por combinación (user, student) para evitar duplicados
          const groupsMap = new Map();
          
          hrvList.forEach((item) => {
            // Si no hay user o student, usar "null" para que no rompa
            const userId = item.user ? item.user._id.toString() : "null";
            const studentId = item.student ? item.student._id.toString() : "null";
            
            // Construimos una llave única para la combinación (user, student)
            const key = `${userId}-${studentId}`;
      
            // Si no existe aún en el mapa, inicializamos la agrupación
            if (!groupsMap.has(key)) {
              groupsMap.set(key, {
                user: item.user || null,
                student: item.student || null,
                todayMeasurements: []
              });
            }
      
            // Agregamos la medición al arreglo correspondiente a (user, student)
            groupsMap.get(key).todayMeasurements.push(item);
          });
      
          // 4. Para cada grupo, conservar solo las últimas 4 mediciones (más recientes)
          const responseArray = [];
          groupsMap.forEach((group) => {
            // group.todayMeasurements ya viene en orden descendente
            // así que solo tomamos las primeras 4
            group.todayMeasurements = group.todayMeasurements.slice(0, 4);
            responseArray.push(group);
          });
      
          // 5. Responder con la estructura solicitada
          return res.status(200).json({
            success: true,
            data: responseArray, // Estructura con user, student, todayMeasurements
          });
        } catch (error) {
          console.error("Error en getHrvListUser:", error);
          return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message,
          });
        }
      },
      getHrvListComplete : async (req, res) => {
        try {
          // Definir el inicio y fin del día en horario local
          const now = new Date();
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(now);
          endOfDay.setHours(23, 59, 59, 999);
      
          // 1. Obtener *todos* los documentos de la colección HRV (para saber qué user/student existen).
          //    Populamos user y student para tener la info (name, lastname, imgUrl) disponible.
          const allHrvDocs = await HRV.find({})
            .sort({ createdAt: -1 })
            .populate("user", "name lastName imgUrl")
            .populate("student", "name lastName imgUrl");
      
          // 2. Obtener SOLO las mediciones de hoy, ordenadas por createdAt DESC
          //    También populamos user y student, para usar esa info luego.
          const hrvToday = await HRV.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          })
            .sort({ createdAt: -1 })
            .populate("user", "name lastName imgUrl")
            .populate("student", "name lastName imgUrl");
      
          /*
            Estructura para agrupar las mediciones de hoy por combinación (userId)-(studentId).
            Clave:  `${userId}-${studentId}`
            Valor:  array de HRVs de hoy para ese par.
          */
          const todayMap = new Map();
      
          hrvToday.forEach((doc) => {
            const userId = doc.user ? doc.user._id.toString() : "null";
            const studentId = doc.student ? doc.student._id.toString() : "null";
            const key = `${userId}-${studentId}`;
            if (!todayMap.has(key)) {
              todayMap.set(key, []);
            }
            todayMap.get(key).push(doc);
          });
      
          /*
            Ahora necesitamos un map/set para *todas* las combinaciones (user, student) 
            que existen en la colección HRV (para que nadie se quede fuera).
          */
          const allCombosMap = new Map();
      
          allHrvDocs.forEach((doc) => {
            const userId = doc.user ? doc.user._id.toString() : "null";
            const studentId = doc.student ? doc.student._id.toString() : "null";
            const key = `${userId}-${studentId}`;
      
            // Si no existe, creamos la estructura básica
            // (solo hace falta guardar "user" y "student" una vez).
            if (!allCombosMap.has(key)) {
              allCombosMap.set(key, {
                user: doc.user || null,
                student: doc.student || null,
              });
            }
          });
      
          // 3. Construir la respuesta final
          const responseArray = [];
      
          /*
            Recorremos todas las combinaciones (user, student).
            Para cada una, buscamos en todayMap sus mediciones de hoy.
            Si no hay mediciones en todayMap, el arreglo queda vacío.
          */
          for (let [key, comboData] of allCombosMap.entries()) {
            // comboData: { user, student }
      
            // Buscamos si en todayMap tenemos mediciones
            const measurements = todayMap.get(key) || [];
      
            // Tomamos las últimas 4 (están en orden descendente)
            const last4 = measurements.slice(0, 4);
      
            responseArray.push({
              user: comboData.user,
              student: comboData.student,
              todayMeasurements: last4,
            });
          }
      
          return res.status(200).json({
            success: true,
            data: responseArray,
          });
        } catch (error) {
          console.error("Error en getHrvListUser:", error);
          return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message,
          });
        }
      }

}

module.exports = hrvController