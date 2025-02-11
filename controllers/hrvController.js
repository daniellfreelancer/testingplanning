const HRV =  require('../models/hrv')
const INSTI = require('../models/institution')



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
      getTodayHRVResultsEnard: async (req, res) => {
        try {
          const { userType, userId } = req.params;
          
                      // 1. Definir el inicio y fin del día en horario local
                      const now = new Date();
                      const startOfDay = new Date(now);
                      startOfDay.setHours(0, 0, 0, 0);
                      const endOfDay = new Date(now);
                      endOfDay.setHours(23, 59, 59, 999);
                  
                      // 2. Obtener TODOS los documentos de la colección HRV
                      //    (para saber todas las combinaciones user-student y encontrar su última medición)
                      const allHrvDocs = await HRV.find({})
                      .sort({ createdAt: -1 })
                        .populate("user", "name age lastName imgUrl vitalmoveCategory")
                        .populate("student", "name age lastName imgUrl vitalmoveCategory");

      
          if (userType === "user") {
              

          
          } else if (userType === "student") {
            
          } else {
            return res.status(400).json({
              message: "Tipo de usuario inválido. Solo se acepta 'user' o 'student'",
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
      },
      getHrvStats : async (req, res) => {
        try {
          let { date } = req.query;
          if (!date) {
            return res.status(400).json({ success: false, message: "Fecha requerida" });
          }
      
            // 1. Definir el inicio y fin del día en horario local
            const adminDate = new Date(date);
            if (isNaN(adminDate.getTime())) {
              return res.status(400).json({ success: false, message: "Fecha inválida" });
            }
            const startOfDay = new Date(Date.UTC(adminDate.getUTCFullYear(), adminDate.getUTCMonth(), adminDate.getUTCDate(), 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(adminDate.getUTCFullYear(), adminDate.getUTCMonth(), adminDate.getUTCDate(), 23, 59, 59, 999));
        
            console.log("startOfDayUTC:", startOfDay.toISOString());
            console.log("endOfDayUTC:", endOfDay.toISOString());
        

            // 2. Obtener TODOS los documentos de la colección HRV
            //    (para saber todas las combinaciones user-student y encontrar su última medición)
            const allHrvDocs = await HRV.find()
            .sort({ createdAt: -1 })
              .populate("user", "name lastName imgUrl vitalmoveCategory age")
              .populate("student", "name lastName imgUrl vitalmoveCategory age");
        
            // 3. Obtener las mediciones SOLO del día de hoy, ordenadas por createdAt DESC
            //    (para construir el arreglo todayMeasurements)
            const hrvToday = await HRV.find({
              createdAt: { $gte: startOfDay, $lte: endOfDay },
            })
              .sort({ createdAt: -1 })
              .populate("user", "name lastName imgUrl vitalmoveCategory age")
              .populate("student", "name lastName imgUrl vitalmoveCategory age");
        
            /*
              Estructura para agrupar las mediciones de hoy por combinación (userId)-(studentId).
              Clave:  `${userId}-${studentId}`
              Valor:  array de HRVs de hoy para ese par (orden descendente).
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
              allCombosMap almacenará la información de cada (user, student):
              - user (objeto populado)
              - student (objeto populado)
              - lastMeasurementDate (la última medición global que exista)
            */
            const allCombosMap = new Map();
        
            /*
              Recorremos todos los documentos (allHrvDocs) para:
              1. Construir la combinación (userId)-(studentId).
              2. Guardar o actualizar la última medición en lastMeasurementDate.
            */
            allHrvDocs.forEach((doc) => {
              const userId = doc.user ? doc.user._id.toString() : "null";
              const studentId = doc.student ? doc.student._id.toString() : "null";
              const key = `${userId}-${studentId}`;
        
              // Si no existe aún en el mapa, lo creamos
              if (!allCombosMap.has(key)) {
                allCombosMap.set(key, {
                  user: doc.user || null,
                  student: doc.student || null,
                  lastMeasurementDate: doc.createdAt, // Inicializamos con la fecha de este doc
                });
              } else {
                // Si ya existe, vemos si la fecha actual es mayor que la almacenada
                const existingEntry = allCombosMap.get(key);
                if (doc.createdAt > existingEntry.lastMeasurementDate) {
                  existingEntry.lastMeasurementDate = doc.createdAt;
                }
              }
            });
        
            // 4. Construimos la respuesta final
            const responseArray = [];
        
            // Recorremos todas las combinaciones en allCombosMap
            for (let [key, comboData] of allCombosMap.entries()) {
              // comboData: { user, student, lastMeasurementDate }
        
              // Buscamos si en todayMap hay mediciones del día de hoy para esta combinación
              const measurements = todayMap.get(key) || [];
        
              // Tomamos las últimas 4 (ya están ordenadas DESC)
              const last4 = measurements.slice(0, 4);
        
              // Armamos el objeto de respuesta
              responseArray.push({
                user: comboData.user,
                student: comboData.student,
                todayMeasurements: last4,
                lastMeasurementDate: comboData.lastMeasurementDate, // <-- se agrega aquí
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
      },
      // getHrvListByInstitution: async (req, res) => {
      //   try {
      //     // 1. Obtener el ID de la institución desde los parámetros de la ruta
      //     const { institutionId } = req.params;
      
      //     // 2. Buscar la institución y poblar el campo 'programs'
      //     const institution = await INSTI.findById(institutionId).populate('programs');
      //     if (!institution) {
      //       return res.status(404).json({
      //         success: false,
      //         message: "Institución no encontrada",
      //       });
      //     }
      
      //     // 3. Extraer todos los IDs de estudiantes de cada programa de la institución
      //     let studentIds = [];
      //     institution.programs.forEach(program => {
      //       if (program.students && program.students.length > 0) {
      //         studentIds = studentIds.concat(program.students);
      //       }
      //     });
      //     // Eliminar posibles duplicados
      //     studentIds = [...new Set(studentIds.map(id => id.toString()))];
      
      //     // Si no hay estudiantes, se retorna un arreglo vacío
      //     if (studentIds.length === 0) {
      //       return res.status(200).json({
      //         success: true,
      //         data: [],
      //       });
      //     }
      
      //     // 4. Definir el inicio y fin del día actual (horario local)
      //     const now = new Date();
      //     const startOfDay = new Date(now);
      //     startOfDay.setHours(0, 0, 0, 0);
      //     const endOfDay = new Date(now);
      //     endOfDay.setHours(23, 59, 59, 999);
      
      //     // 5. Obtener TODAS las mediciones HRV de los estudiantes filtrados por la institución
      //     const allHrvDocs = await HRV.find({
      //       student: { $in: studentIds }
      //     })
      //       .sort({ createdAt: -1 })
      //       .populate("user", "name lastName imgUrl vitalmoveCategory")
      //       .populate("student", "name lastName imgUrl vitalmoveCategory");
      
      //     // 6. Obtener las mediciones del día de hoy para estos estudiantes
      //     const hrvToday = await HRV.find({
      //       student: { $in: studentIds },
      //       createdAt: { $gte: startOfDay, $lte: endOfDay }
      //     })
      //       .sort({ createdAt: -1 })
      //       .populate("user", "name lastName imgUrl vitalmoveCategory")
      //       .populate("student", "name lastName imgUrl vitalmoveCategory");
      
      //     // 7. Agrupar las mediciones de hoy por combinación (userId)-(studentId)
      //     const todayMap = new Map();
      //     hrvToday.forEach(doc => {
      //       const userId = doc.user ? doc.user._id.toString() : "null";
      //       const studentId = doc.student ? doc.student._id.toString() : "null";
      //       const key = `${userId}-${studentId}`;
      //       if (!todayMap.has(key)) {
      //         todayMap.set(key, []);
      //       }
      //       todayMap.get(key).push(doc);
      //     });
      
      //     // 8. Recorrer todas las mediciones (allHrvDocs) para obtener, por combinación, 
      //     //    la última medición global.
      //     const allCombosMap = new Map();
      //     allHrvDocs.forEach(doc => {
      //       const userId = doc.user ? doc.user._id.toString() : "null";
      //       const studentId = doc.student ? doc.student._id.toString() : "null";
      //       const key = `${userId}-${studentId}`;
      //       if (!allCombosMap.has(key)) {
      //         allCombosMap.set(key, {
      //           user: doc.user || null,
      //           student: doc.student || null,
      //           lastMeasurementDate: doc.createdAt, // Inicializamos con la fecha de este documento
      //         });
      //       } else {
      //         const existingEntry = allCombosMap.get(key);
      //         if (doc.createdAt > existingEntry.lastMeasurementDate) {
      //           existingEntry.lastMeasurementDate = doc.createdAt;
      //         }
      //       }
      //     });
      
      //     // 9. Construir el arreglo de respuesta final
      //     const responseArray = [];
      //     for (let [key, comboData] of allCombosMap.entries()) {
      //       // Obtener las mediciones del día (si existen) para la combinación user-student
      //       const measurements = todayMap.get(key) || [];
      //       // Tomar las últimas 4 mediciones (ya ordenadas descendentemente)
      //       const last4 = measurements.slice(0, 4);
      //       responseArray.push({
      //         user: comboData.user,
      //         student: comboData.student,
      //         todayMeasurements: last4,
      //         lastMeasurementDate: comboData.lastMeasurementDate,
      //       });
      //     }
      
      //     // 10. Ordenar el arreglo por apellido del estudiante (lastName) de forma alfabética
      //     responseArray.sort((a, b) => {
      //       if (
      //         a.student &&
      //         b.student &&
      //         a.student.lastName &&
      //         b.student.lastName
      //       ) {
      //         return a.student.lastName.localeCompare(b.student.lastName);
      //       }
      //       return 0;
      //     });
      
      //     // 11. Retornar la respuesta
      //     return res.status(200).json({
      //       success: true,
      //       data: responseArray,
      //     });
      //   } catch (error) {
      //     console.error("Error en getHrvListByInstitution:", error);
      //     return res.status(500).json({
      //       success: false,
      //       message: "Error interno del servidor",
      //       error: error.message,
      //     });
      //   }
      // }
      getHrvListByInstitution: async (req, res) => {
        try {
          // 1. Obtener el ID de la institución
          const { institutionId } = req.params;
      
          // 2. Buscar la institución y poblar:
          //    - Los programas
          //    - Dentro de cada programa, los estudiantes (con algunos campos)
          const institution = await INSTI.findById(institutionId).populate({
            path: 'programs',
            populate: { 
              path: 'students', 
              select: 'name lastName imgUrl vitalmoveCategory age' 
            }
          });
      
          if (!institution) {
            return res.status(404).json({
              success: false,
              message: "Institución no encontrada",
            });
          }
      
          // 3. Extraer todos los estudiantes de cada programa y armamos un map
          //    que tenga como clave el ID del estudiante y como valor la estructura de respuesta
          const studentMap = new Map();
          institution.programs.forEach(program => {
            if (program.students && program.students.length > 0) {
              program.students.forEach(student => {
                const studentId = student._id.toString();
                // Si aún no está en el map, lo agregamos
                if (!studentMap.has(studentId)) {
                  studentMap.set(studentId, {
                    user: null,
                    student: student,
                    todayMeasurements: [],
                    lastMeasurementDate: null
                  });
                }
              });
            }
          });
      
          // Convertimos las llaves del map a un arreglo para filtrar en las consultas HRV
          const studentIds = Array.from(studentMap.keys());
          if (studentIds.length === 0) {
            return res.status(200).json({
              success: true,
              data: [],
            });
          }
      
          // 4. Definir el inicio y fin del día actual (horario local)
          const now = new Date();
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(now);
          endOfDay.setHours(23, 59, 59, 999);
      
          // 5. Obtener TODAS las mediciones HRV de los estudiantes filtrados (ordenadas DESC)
          const allHrvDocs = await HRV.find({
            student: { $in: studentIds }
          })
            .sort({ createdAt: -1 })
            .populate("user", "name lastName imgUrl vitalmoveCategory age")
            .populate("student", "name lastName imgUrl vitalmoveCategory age");
      
          // 6. Obtener las mediciones de hoy para estos estudiantes
          const hrvTodayDocs = await HRV.find({
            student: { $in: studentIds },
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          })
            .sort({ createdAt: -1 })
            .populate("user", "name lastName imgUrl vitalmoveCategory age")
            .populate("student", "name lastName imgUrl vitalmoveCategory age");
      
          // 7. Actualizar el map con la última medición global para cada estudiante
          allHrvDocs.forEach(doc => {
            const stuId = doc.student ? doc.student._id.toString() : null;
            if (!stuId) return;
            if (!studentMap.has(stuId)) return; // En teoría siempre existe
            const entry = studentMap.get(stuId);
            // Si no se ha definido aún lastMeasurementDate o si esta medición es más reciente, la asignamos
            if (!entry.lastMeasurementDate || doc.createdAt > entry.lastMeasurementDate) {
              entry.lastMeasurementDate = doc.createdAt;
              entry.user = doc.user || null;
            }
          });
      
          // 8. Agrupar las mediciones de hoy por estudiante
          const todayMap = new Map();
          hrvTodayDocs.forEach(doc => {
            const stuId = doc.student ? doc.student._id.toString() : null;
            if (!stuId) return;
            if (!todayMap.has(stuId)) {
              todayMap.set(stuId, []);
            }
            todayMap.get(stuId).push(doc);
          });
      
          // 9. Para cada estudiante, asignar las últimas 4 mediciones del día (si existen)
          studentMap.forEach((entry, stuId) => {
            const measurements = todayMap.get(stuId) || [];
            entry.todayMeasurements = measurements.slice(0, 4);
          });
      
          // 10. Convertir el map a un arreglo
          let responseArray = Array.from(studentMap.values());
      
          // 11. Ordenar el arreglo por apellido del estudiante (lastName) de forma alfabética
          responseArray.sort((a, b) => {
            if (a.student.lastName && b.student.lastName) {
              return a.student.lastName.localeCompare(b.student.lastName);
            }
            return 0;
          });
      
          // 12. Retornar la respuesta
          return res.status(200).json({
            success: true,
            data: responseArray,
          });
        } catch (error) {
          console.error("Error en getHrvListByInstitution:", error);
          return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message,
          });
        }
      },
      getHrvListByUserFilter: async (req, res) => {
        try {
          // 1. Extraer los parámetros: userType, id (del usuario) y institucionId
          const { userType, id, institucionId } = req.params;
      
          // Validar que userType sea 'student' o 'user'
          if (!['student', 'user'].includes(userType)) {
            return res.status(400).json({
              success: false,
              message: "Tipo de usuario inválido. Debe ser 'student' o 'user'."
            });
          }
      
          // 2. Buscar la institución y poblar sus programas y estudiantes
          const institution = await INSTI.findById(institucionId).populate({
            path: 'programs',
            populate: {
              path: 'students',
              select: 'name lastName age imgUrl vitalmoveCategory'
            }
          });
      
          if (!institution) {
            return res.status(404).json({
              success: false,
              message: "Institución no encontrada."
            });
          }
      
          // 3. Extraer todos los IDs de los estudiantes de la institución
          const studentIds = [];
          institution.programs.forEach(program => {
            if (program.students && program.students.length > 0) {
              program.students.forEach(student => {
                studentIds.push(student._id.toString());
              });
            }
          });
      
          if (studentIds.length === 0) {
            return res.status(200).json({
              success: true,
              data: []
            });
          }
      
          // 4. Definir el inicio y fin del día actual (horario local)
          const now = new Date();
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(now);
          endOfDay.setHours(23, 59, 59, 999);
      
          // 5. Construir el filtro base: mediciones de hoy de los estudiantes de la institución
          let filter = {
            student: { $in: studentIds },
            createdAt: { $gte: startOfDay, $lte: endOfDay }
          };
      
          // 6. Dependiendo del tipo de usuario, ajustar el filtro
          if (userType === 'student') {
            // Verificar que el estudiante esté asociado a la institución
            if (!studentIds.includes(id)) {
              return res.status(404).json({
                success: false,
                message: "Estudiante no encontrado en la institución."
              });
            }
            // Filtrar por el id del estudiante
            filter.student = id;
          } else if (userType === 'user') {
            // Filtrar por el id del usuario (quien realizó la medición)
            filter.user = id;
          }
      
          // 7. Consultar las mediciones HRV que cumplan con el filtro, ordenadas de forma descendente
          const measurements = await HRV.find(filter)
            .sort({ createdAt: -1 })
            .populate("user", "name lastName age imgUrl vitalmoveCategory")
            .populate("student", "name lastName age imgUrl vitalmoveCategory");
      
          // 8. Retornar únicamente el array de mediciones
          return res.status(200).json({
            success: true,
            data: measurements
          });
        } catch (error) {
          console.error("Error en getHrvListByInstitution:", error);
          return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
          });
        }
      },
      getHRVInsti : async (req, res) => {
        try {
          // 1. Obtener el ID de la institución y la fecha
          const { institutionId } = req.params;
          let { date } = req.query;
          if (!date) {
            return res.status(400).json({ success: false, message: "Fecha requerida" });
          }
      
          // 2. Convertir la fecha proporcionada a UTC
          const userDate = new Date(date);
          if (isNaN(userDate.getTime())) {
            return res.status(400).json({ success: false, message: "Fecha inválida" });
          }
          
          const startOfDayUTC = new Date(Date.UTC(userDate.getUTCFullYear(), userDate.getUTCMonth(), userDate.getUTCDate(), 0, 0, 0, 0));
          const endOfDayUTC = new Date(Date.UTC(userDate.getUTCFullYear(), userDate.getUTCMonth(), userDate.getUTCDate(), 23, 59, 59, 999));
      
          // 3. Buscar la institución y poblar programas con estudiantes
          const institution = await INSTI.findById(institutionId).populate({
            path: "programs",
            populate: {
              path: "students",
              select: "name lastName imgUrl vitalmoveCategory age"
            }
          });
      
          if (!institution) {
            return res.status(404).json({ success: false, message: "Institución no encontrada" });
          }
      
          // 4. Crear un mapa de estudiantes
          const studentMap = new Map();
          institution.programs.forEach(program => {
            program.students.forEach(student => {
              const studentId = student._id.toString();
              if (!studentMap.has(studentId)) {
                studentMap.set(studentId, {
                  user: null,
                  student,
                  todayMeasurements: [],
                  lastMeasurementDate: null
                });
              }
            });
          });
      
          const studentIds = Array.from(studentMap.keys());
          if (studentIds.length === 0) {
            return res.status(200).json({ success: true, data: [] });
          }
      
          // 5. Obtener todas las mediciones HRV ordenadas por fecha descendente
          const allHrvDocs = await HRV.find({ student: { $in: studentIds } })
            .sort({ createdAt: -1 })
            .populate("user", "name lastName imgUrl vitalmoveCategory age")
            .populate("student", "name lastName imgUrl vitalmoveCategory age");
      
          // 6. Obtener mediciones HRV del día actual en UTC
          const hrvTodayDocs = await HRV.find({
            student: { $in: studentIds },
            createdAt: { $gte: startOfDayUTC, $lte: endOfDayUTC }
          })
            .sort({ createdAt: -1 })
            .populate("user", "name lastName imgUrl vitalmoveCategory age")
            .populate("student", "name lastName imgUrl vitalmoveCategory age");
      
          // 7. Asignar la última medición a cada estudiante
          allHrvDocs.forEach(doc => {
            const stuId = doc.student?._id.toString();
            if (stuId && studentMap.has(stuId)) {
              const entry = studentMap.get(stuId);
              if (!entry.lastMeasurementDate || doc.createdAt > entry.lastMeasurementDate) {
                entry.lastMeasurementDate = doc.createdAt;
                entry.user = doc.user || null;
              }
            }
          });
      
          // 8. Agrupar las mediciones de hoy por estudiante
          const todayMap = new Map();
          hrvTodayDocs.forEach(doc => {
            const stuId = doc.student?._id.toString();
            if (stuId) {
              if (!todayMap.has(stuId)) {
                todayMap.set(stuId, []);
              }
              todayMap.get(stuId).push(doc);
            }
          });
      
          // 9. Asignar las últimas 4 mediciones del día a cada estudiante
          studentMap.forEach((entry, stuId) => {
            entry.todayMeasurements = (todayMap.get(stuId) || []).slice(0, 4);
          });
      
          // 10. Convertir el mapa a un array y ordenar por apellido
          // const responseArray = Array.from(studentMap.values()).sort((a, b) =>
          //   a.student.lastName.localeCompare(b.student.lastName)
          // );
      
          // 10. Convertir el mapa a un array y ordenar primero los que tienen mediciones
    const responseArray = Array.from(studentMap.values()).sort((a, b) => {
      if (b.todayMeasurements.length !== a.todayMeasurements.length) {
        return b.todayMeasurements.length - a.todayMeasurements.length;
      }
      return a.student.lastName.localeCompare(b.student.lastName);
    });

          return res.status(200).json({ success: true, data: responseArray });
        } catch (error) {
          console.error("Error en getHrvListByInstitution:", error);
          return res.status(500).json({ success: false, message: "Error interno del servidor", error: error.message });
        }
      },
      getHRVtodayUser : async (req, res) =>{
        try {
          // 1. Extraer los parámetros: userType, id (del usuario) y institucionId
          const { userType, id, institucionId } = req.params;
          let { date } = req.query;
          if (!date) {
            return res.status(400).json({ success: false, message: "Fecha requerida" });
          }
      
          // Validar que userType sea 'student' o 'user'
          if (!['student', 'user'].includes(userType)) {
            return res.status(400).json({ success: false, message: "Tipo de usuario inválido. Debe ser 'student' o 'user'." });
          }
      
          // 2. Convertir la fecha proporcionada a UTC
          const userDate = new Date(date);
          if (isNaN(userDate.getTime())) {
            return res.status(400).json({ success: false, message: "Fecha inválida" });
          }
          
          const startOfDayUTC = new Date(Date.UTC(userDate.getUTCFullYear(), userDate.getUTCMonth(), userDate.getUTCDate(), 0, 0, 0, 0));
          const endOfDayUTC = new Date(Date.UTC(userDate.getUTCFullYear(), userDate.getUTCMonth(), userDate.getUTCDate(), 23, 59, 59, 999));
      

          console.log("startOfDayUTC:", startOfDayUTC.toISOString());
          console.log("endOfDayUTC:", endOfDayUTC.toISOString());
      

          // 3. Buscar la institución y poblar programas con estudiantes
          const institution = await INSTI.findById(institucionId).populate({
            path: "programs",
            populate: {
              path: "students",
              select: "name lastName imgUrl vitalmoveCategory age"
            }
          });
      
          if (!institution) {
            return res.status(404).json({ success: false, message: "Institución no encontrada." });
          }
      
          // 4. Extraer todos los IDs de los estudiantes de la institución
          const studentIds = institution.programs.flatMap(program => program.students.map(student => student._id.toString()));
      
          if (studentIds.length === 0) {
            return res.status(200).json({ success: true, data: [] });
          }
      
          // 5. Construir el filtro base para obtener mediciones HRV de los estudiantes en la institución
          let filter = {
            student: { $in: studentIds },
            createdAt: { $gte: startOfDayUTC, $lte: endOfDayUTC }
          };
      
          // 6. Dependiendo del tipo de usuario, ajustar el filtro
          if (userType === 'student') {
            if (!studentIds.includes(id)) {
              return res.status(404).json({ success: false, message: "Estudiante no encontrado en la institución." });
            }
            filter.student = id;
          } else if (userType === 'user') {
            filter.user = id;
          }
      
          // 7. Consultar las mediciones HRV con el filtro
          const measurements = await HRV.find(filter)
            .sort({ createdAt: -1 })
            .populate("user", "name lastName imgUrl vitalmoveCategory age")
            .populate("student", "name lastName imgUrl vitalmoveCategory age");
      
          return res.status(200).json({ success: true, data: measurements });
        } catch (error) {
          console.error("Error en getHrvTodayUser:", error);
          return res.status(500).json({ success: false, message: "Error interno del servidor", error: error.message });
        }
      }
      ,getHRVLastSevenUser : async (req, res) =>{
        try {
          // 1. Extraer los parámetros: userType, id (del usuario) y institucionId
          const { userType, id, institucionId } = req.params;
          let { date } = req.query;
          if (!date) {
            return res.status(400).json({ success: false, message: "Fecha requerida" });
          }
      
          // Validar que userType sea 'student' o 'user'
          if (!['student', 'user'].includes(userType)) {
            return res.status(400).json({ success: false, message: "Tipo de usuario inválido. Debe ser 'student' o 'user'." });
          }
      
          // 2. Convertir la fecha proporcionada a UTC y calcular los últimos 7 días
          const userDate = new Date(date);
          if (isNaN(userDate.getTime())) {
            return res.status(400).json({ success: false, message: "Fecha inválida" });
          }
          
          const startOfSevenDaysAgoUTC = new Date(Date.UTC(userDate.getUTCFullYear(), userDate.getUTCMonth(), userDate.getUTCDate() - 6, 0, 0, 0, 0));
          const endOfDayUTC = new Date(Date.UTC(userDate.getUTCFullYear(), userDate.getUTCMonth(), userDate.getUTCDate(), 23, 59, 59, 999));
      
          console.log("startOfSevenDaysAgoUTC:", startOfSevenDaysAgoUTC.toISOString());
          console.log("endOfDayUTC:", endOfDayUTC.toISOString());
      
          // 3. Buscar la institución y poblar programas con estudiantes
          const institution = await INSTI.findById(institucionId).populate({
            path: "programs",
            populate: {
              path: "students",
              select: "name lastName imgUrl vitalmoveCategory age"
            }
          });
      
          if (!institution) {
            return res.status(404).json({ success: false, message: "Institución no encontrada." });
          }
      
          // 4. Extraer todos los IDs de los estudiantes de la institución
          const studentIds = institution.programs.flatMap(program => program.students.map(student => student._id.toString()));
      
          if (studentIds.length === 0) {
            return res.status(200).json({ success: true, data: [] });
          }
      
          // 5. Construir el filtro base para obtener mediciones HRV de los últimos 7 días
          let filter = {
            student: { $in: studentIds },
            createdAt: { $gte: startOfSevenDaysAgoUTC, $lte: endOfDayUTC }
          };
      
          // 6. Dependiendo del tipo de usuario, ajustar el filtro
          if (userType === 'student') {
            if (!studentIds.includes(id)) {
              return res.status(404).json({ success: false, message: "Estudiante no encontrado en la institución." });
            }
            filter.student = id;
          } else if (userType === 'user') {
            filter.user = id;
          }
      
          // 7. Consultar las mediciones HRV con el filtro
          const measurements = await HRV.find(filter)
            .sort({ createdAt: -1 })
            .populate("user", "name lastName imgUrl vitalmoveCategory age")
            .populate("student", "name lastName imgUrl vitalmoveCategory age");
      
          return res.status(200).json({ success: true, data: measurements });
        } catch (error) {
          console.error("Error en getHrvLastSevenDaysUser:", error);
          return res.status(500).json({ success: false, message: "Error interno del servidor", error: error.message });
        }
      },
      getHRVLastThirtyUser : async (req, res) =>{
        try {
          // 1. Extraer los parámetros: userType, id (del usuario) y institucionId
          const { userType, id, institucionId } = req.params;
          let { date } = req.query;
          if (!date) {
            return res.status(400).json({ success: false, message: "Fecha requerida" });
          }
      
          // Validar que userType sea 'student' o 'user'
          if (!['student', 'user'].includes(userType)) {
            return res.status(400).json({ success: false, message: "Tipo de usuario inválido. Debe ser 'student' o 'user'." });
          }
      
          // 2. Convertir la fecha proporcionada a UTC y calcular los últimos 7 días
          const userDate = new Date(date);
          if (isNaN(userDate.getTime())) {
            return res.status(400).json({ success: false, message: "Fecha inválida" });
          }
          
          const startOfSevenDaysAgoUTC = new Date(Date.UTC(userDate.getUTCFullYear(), userDate.getUTCMonth(), userDate.getUTCDate() - 29, 0, 0, 0, 0));
          const endOfDayUTC = new Date(Date.UTC(userDate.getUTCFullYear(), userDate.getUTCMonth(), userDate.getUTCDate(), 23, 59, 59, 999));
      
          console.log("startOfSevenDaysAgoUTC:", startOfSevenDaysAgoUTC.toISOString());
          console.log("endOfDayUTC:", endOfDayUTC.toISOString());
      
          // 3. Buscar la institución y poblar programas con estudiantes
          const institution = await INSTI.findById(institucionId).populate({
            path: "programs",
            populate: {
              path: "students",
              select: "name lastName imgUrl vitalmoveCategory age"
            }
          });
      
          if (!institution) {
            return res.status(404).json({ success: false, message: "Institución no encontrada." });
          }
      
          // 4. Extraer todos los IDs de los estudiantes de la institución
          const studentIds = institution.programs.flatMap(program => program.students.map(student => student._id.toString()));
      
          if (studentIds.length === 0) {
            return res.status(200).json({ success: true, data: [] });
          }
      
          // 5. Construir el filtro base para obtener mediciones HRV de los últimos 7 días
          let filter = {
            student: { $in: studentIds },
            createdAt: { $gte: startOfSevenDaysAgoUTC, $lte: endOfDayUTC }
          };
      
          // 6. Dependiendo del tipo de usuario, ajustar el filtro
          if (userType === 'student') {
            if (!studentIds.includes(id)) {
              return res.status(404).json({ success: false, message: "Estudiante no encontrado en la institución." });
            }
            filter.student = id;
          } else if (userType === 'user') {
            filter.user = id;
          }
      
          // 7. Consultar las mediciones HRV con el filtro
          const measurements = await HRV.find(filter)
            .sort({ createdAt: -1 })
            .populate("user", "name lastName imgUrl vitalmoveCategory age")
            .populate("student", "name lastName imgUrl vitalmoveCategory age");
      
          return res.status(200).json({ success: true, data: measurements });
        } catch (error) {
          console.error("Error en getHrvLastSevenDaysUser:", error);
          return res.status(500).json({ success: false, message: "Error interno del servidor", error: error.message });
        }
      }
      
      

}

module.exports = hrvController