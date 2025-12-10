const TalleresDeportivos = require('./talleresDeportivosPteAlto');
const EspaciosDeportivos = require('../espacios-deportivos/espaciosDeportivosPteAlto');
const { uploadMulterFile } = require('../../../utils/s3Client'); // helper centralizado
const bucketRegion = process.env.AWS_BUCKET_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;

const talleresDeportivosPteAltoController = {
  // crear taller deportivo PTE Alto y agregarlo al espacio deportivo en caso de tenerlo
  crearTallerDeportivoPteAlto: async (req, res) => {
    try {
      console.log('🔵 CREAR TALLER - req.body:', req.body);
      console.log(
        '🔵 CREAR TALLER - req.files:',
        req.files ? `Sí (${req.files.length} archivos)` : 'No'
      );

      // Parsear arrays JSON si vienen como strings
      const bodyData = { ...req.body };
      if (typeof bodyData.horarios === 'string') {
        bodyData.horarios = JSON.parse(bodyData.horarios);
      }
      if (typeof bodyData.dias === 'string') {
        bodyData.dias = JSON.parse(bodyData.dias);
      }

      const nuevoTallerDeportivoPteAlto = new TalleresDeportivos(bodyData);

      // Subir una o hasta 5 imágenes al campo galeria del taller deportivo
      if (req.files && req.files.length > 0) {
        const galeria = [];
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (const file of req.files) {
          const extension = file.originalname.split('.').pop().toLowerCase();

          // Validar extensión
          if (!allowedExtensions.includes(extension)) {
            return res.status(400).json({
              message: `Tipo de archivo no permitido: ${extension}. Solo se permiten imágenes (jpg, jpeg, png, gif, webp)`,
              success: false,
            });
          }

          // Validar tamaño
          if (file.size > maxSize) {
            return res.status(400).json({
              message: `El archivo ${file.originalname} excede el tamaño máximo de 5MB`,
              success: false,
            });
          }

          try {
            // Subir archivo a S3 usando helper
            const key = await uploadMulterFile(file);
            const fileUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`;
            galeria.push(fileUrl);
          } catch (uploadError) {
            console.error(`Error al subir archivo ${file.originalname}:`, uploadError);
            return res.status(500).json({
              message: `Error al subir el archivo ${file.originalname}`,
              error: uploadError.message,
              success: false,
            });
          }
        }

        nuevoTallerDeportivoPteAlto.galeria = galeria;
        console.log(`✅ ${galeria.length} imágenes subidas a la galería`);
      } else {
        console.log('⚠️ No se recibieron archivos en req.files');
      }

      // Guardar taller primero
      await nuevoTallerDeportivoPteAlto.save();

      // Si viene espacioDeportivo por query, se asocia
      if (req.query.espacioDeportivo) {
        const espacioDeportivoEncontrado = await EspaciosDeportivos.findById(
          req.query.espacioDeportivo
        );
        if (!espacioDeportivoEncontrado) {
          return res.status(404).json({
            message: 'Espacio deportivo no encontrado',
            success: false,
          });
        }

        espacioDeportivoEncontrado.talleres.push(
          nuevoTallerDeportivoPteAlto._id
        );
        await espacioDeportivoEncontrado.save();

        nuevoTallerDeportivoPteAlto.espacioDeportivo =
          espacioDeportivoEncontrado._id;
        await nuevoTallerDeportivoPteAlto.save();
      } else {
        nuevoTallerDeportivoPteAlto.espacioDeportivo = null;
        await nuevoTallerDeportivoPteAlto.save();
      }

      console.log(
        ' Taller creado con galería:',
        nuevoTallerDeportivoPteAlto.galeria
      );

      res.status(201).json({
        message: 'Taller deportivo PTE Alto creado correctamente',
        response: nuevoTallerDeportivoPteAlto,
        success: true,
      });
    } catch (error) {
      console.error('❌ Error al crear taller:', error);
      res.status(500).json({
        message: 'Error al crear el taller deportivo PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },

  obtenerTodosLosTalleresDeportivosPteAlto: async (req, res) => {
    try {
      const talleresDeportivosPteAlto = await TalleresDeportivos.find();
      res.status(200).json({
        message: 'Talleres deportivos PTE Alto obtenidos correctamente',
        response: talleresDeportivosPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al obtener los talleres deportivos PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },

  obtenerTallerDeportivoPteAltoPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const tallerDeportivoPteAlto = await TalleresDeportivos.findById(id);
      res.status(200).json({
        message: 'Taller deportivo PTE Alto obtenido correctamente',
        response: tallerDeportivoPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al obtener el taller deportivo PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },

  actualizarTallerDeportivoPteAltoPorId: async (req, res) => {
    try {
      console.log('🔵 ACTUALIZAR TALLER - req.body:', req.body);
      console.log(
        '🔵 ACTUALIZAR TALLER - req.files:',
        req.files ? `Sí (${req.files.length} archivos)` : 'No'
      );

      const { id } = req.params;
      let updateData = { ...req.body };

      // Si se suben nuevas imágenes, procesarlas
      if (req.files && req.files.length > 0) {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        // galeria puede venir como JSON string desde el front
        const galeriaExistente = updateData.galeria
          ? JSON.parse(updateData.galeria)
          : [];

        const nuevasImagenes = [];

        console.log(`📸 Procesando ${req.files.length} nuevas imágenes`);

        for (const file of req.files) {
          const extension = file.originalname.split('.').pop().toLowerCase();

          if (!allowedExtensions.includes(extension)) {
            return res.status(400).json({
              message: `Tipo de archivo no permitido: ${extension}`,
              success: false,
            });
          }

          if (file.size > maxSize) {
            return res.status(400).json({
              message: `El archivo ${file.originalname} excede 5MB`,
              success: false,
            });
          }

          try {
            const key = await uploadMulterFile(file);
            const fileUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`;
            nuevasImagenes.push(fileUrl);
            console.log('✅ Imagen subida:', fileUrl);
          } catch (uploadError) {
            console.error(`Error al subir ${file.originalname}:`, uploadError);
            return res.status(500).json({
              message: `Error al subir ${file.originalname}`,
              error: uploadError.message,
              success: false,
            });
          }
        }

        // Combinar galería existente con nuevas imágenes (máximo 5)
        const galeriaCompleta = [...galeriaExistente, ...nuevasImagenes].slice(
          0,
          5
        );
        updateData.galeria = galeriaCompleta;
        console.log(
          `📚 Galería actualizada con ${galeriaCompleta.length} imágenes`
        );
      }

      const tallerDeportivoPteAlto =
        await TalleresDeportivos.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      console.log(
        '✅ Taller actualizado con galería:',
        tallerDeportivoPteAlto?.galeria
      );

      res.status(200).json({
        message: 'Taller deportivo PTE Alto actualizado correctamente',
        response: tallerDeportivoPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al actualizar el taller deportivo PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },

  eliminarTallerDeportivoPteAltoPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const tallerDeportivoPteAlto =
        await TalleresDeportivos.findByIdAndDelete(id);

      // En caso de estar asociado a un espacio deportivo, eliminar la referencia
      if (tallerDeportivoPteAlto?.espacioDeportivo) {
        const espacioDeportivoEncontrado = await EspaciosDeportivos.findById(
          tallerDeportivoPteAlto.espacioDeportivo
        );
        if (espacioDeportivoEncontrado) {
          espacioDeportivoEncontrado.talleres =
            espacioDeportivoEncontrado.talleres.filter(
              (taller) =>
                taller.toString() !==
                tallerDeportivoPteAlto._id.toString()
            );
          await espacioDeportivoEncontrado.save();
        }
      }

      res.status(200).json({
        message: 'Taller deportivo PTE Alto eliminado correctamente',
        response: tallerDeportivoPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al eliminar el taller deportivo PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },
};

module.exports = talleresDeportivosPteAltoController;
