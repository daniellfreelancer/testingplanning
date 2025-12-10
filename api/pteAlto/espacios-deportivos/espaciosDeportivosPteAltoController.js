const EspaciosDeportivos = require('./espaciosDeportivosPteAlto');
const ComplejosDeportivos = require('../complejos-deportivos/complejosDeportivosPteAlto');
const { uploadMulterFile } = require('../../../utils/s3Client'); // helper centralizado

const bucketRegion = process.env.AWS_BUCKET_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

const espaciosDeportivosPteAltoController = {
  // Crear espacio deportivo PTE Alto, agregarlo y asociarlo al complejo deportivo
  crearEspacioDeportivoPteAlto: async (req, res) => {
    try {
      console.log('🔵 CREAR ESPACIO - req.body:', req.body);
      console.log(
        '🔵 CREAR ESPACIO - req.file:',
        req.file ? `Sí (${req.file.originalname})` : 'No'
      );

      const { complejoDeportivo } = req.params;

      const nuevoEspacioDeportivoPteAlto = new EspaciosDeportivos({
        ...req.body,
      });

      nuevoEspacioDeportivoPteAlto.complejoDeportivo = complejoDeportivo;

      // Si viene imgUrl (por ejemplo desde Cloudinary), la usamos tal cual
      if (req.body.imgUrl) {
        nuevoEspacioDeportivoPteAlto.imgUrl = req.body.imgUrl;
      }

      // Primero guardamos para tener _id disponible
      await nuevoEspacioDeportivoPteAlto.save();

      // Si viene archivo, lo subimos a S3 usando el helper
      if (req.file) {
        try {
          console.log('📁 Procesando archivo:', req.file.originalname);

          // Subida a S3 -> devuelve el "key" del objeto
          const key = await uploadMulterFile(req.file);

          // Generamos la URL pública (si tu bucket es público)
       //   const fileUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`;
          const fileUrl = `${cloudfrontUrl}/${key}`;

          nuevoEspacioDeportivoPteAlto.imgUrl = fileUrl;
          await nuevoEspacioDeportivoPteAlto.save();

          console.log('✅ Imagen subida a S3:', fileUrl);
        } catch (uploadErr) {
          console.error('❌ Error subiendo imagen a S3:', uploadErr);
          return res.status(500).json({
            message: 'Error al subir la imagen del espacio deportivo',
            error: uploadErr.message,
            success: false,
          });
        }
      } else {
        console.log('⚠️ No se recibió archivo en req.file');
      }

      // Asociar el espacio al complejo deportivo
      const complejoEncontrado = await ComplejosDeportivos.findById(
        complejoDeportivo
      );

      if (complejoEncontrado) {
        complejoEncontrado.espaciosDeportivos.push(
          nuevoEspacioDeportivoPteAlto._id
        );
        await complejoEncontrado.save();
      }

      console.log(
        '✅ Espacio creado con imgUrl:',
        nuevoEspacioDeportivoPteAlto.imgUrl
      );

      res.status(201).json({
        message: 'Espacio deportivo creado correctamente',
        response: nuevoEspacioDeportivoPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al crear el espacio deportivo PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },

  obtenerTodosLosEspaciosDeportivosPteAlto: async (req, res) => {
    try {
      const espaciosDeportivosPteAlto = await EspaciosDeportivos.find();
      res.status(200).json({
        message: 'Espacios deportivos PTE Alto obtenidos correctamente',
        response: espaciosDeportivosPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al obtener los espacios deportivos PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },

  obtenerEspacioDeportivoPteAltoPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const espacioDeportivoPteAlto = await EspaciosDeportivos.findById(id);

      res.status(200).json({
        message: 'Espacio deportivo PTE Alto obtenido correctamente',
        response: espacioDeportivoPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al obtener el espacio deportivo PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },

  actualizarEspacioDeportivoPteAltoPorId: async (req, res) => {
    try {
      const { id } = req.params;
      let updateData = { ...req.body };

      // Si se sube una nueva imagen, procesarla con el helper
      if (req.file) {
        try {
          const key = await uploadMulterFile(req.file);
        //  const fileUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`;
          const fileUrl = `${cloudfrontUrl}/${key}`;
          updateData.imgUrl = fileUrl;
        } catch (uploadErr) {
          console.error('❌ Error subiendo nueva imagen a S3:', uploadErr);
          return res.status(500).json({
            message: 'Error al subir la nueva imagen del espacio deportivo',
            error: uploadErr.message,
            success: false,
          });
        }
      }

      const espacioDeportivoPteAlto =
        await EspaciosDeportivos.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      res.status(200).json({
        message:
          'Espacio deportivo PTE Alto actualizado correctamente',
        response: espacioDeportivoPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message:
          'Error al actualizar el espacio deportivo PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },

  eliminarEspacioDeportivoPteAltoPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const espacioDeportivoPteAlto =
        await EspaciosDeportivos.findByIdAndDelete(id);

      if (espacioDeportivoPteAlto) {
        // Eliminar el espacio deportivo del complejo deportivo
        const complejoEncontrado = await ComplejosDeportivos.findById(
          espacioDeportivoPteAlto.complejoDeportivo
        );

        if (complejoEncontrado) {
          complejoEncontrado.espaciosDeportivos =
            complejoEncontrado.espaciosDeportivos.filter(
              (espacio) =>
                espacio.toString() !==
                espacioDeportivoPteAlto._id.toString()
            );
          await complejoEncontrado.save();
        }
      }

      res.status(200).json({
        message:
          'Espacio deportivo PTE Alto eliminado correctamente',
        response: espacioDeportivoPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message:
          'Error al eliminar el espacio deportivo PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },
};

module.exports = espaciosDeportivosPteAltoController;
