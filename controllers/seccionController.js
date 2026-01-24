const Seccion = require('../models/seccion');
const { uploadToS3, deleteFromS3 } = require('../utils/s3CloudFront');

// Obtener todas las secciones (admin)
exports.getAllSecciones = async (req, res) => {
  try {
    const secciones = await Seccion.find()
      .populate('parentSeccion', 'titulo slug')
      .sort({ orden: 1 });

    res.status(200).json({
      success: true,
      data: secciones
    });
  } catch (error) {
    console.error('Error al obtener secciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener secciones',
      error: error.message
    });
  }
};

// Obtener secciones públicas (para navegación y listados públicos)
exports.getSeccionesPublicas = async (req, res) => {
  try {
    const secciones = await Seccion.find({
      activo: true,
      visibilidad: 'publica',
      mostrarEnNavegacion: true
    })
    .populate('parentSeccion', 'titulo slug')
    .sort({ orden: 1 })
    .select('-contenido -archivos'); // No enviar contenido completo en listados

    res.status(200).json({
      success: true,
      data: secciones
    });
  } catch (error) {
    console.error('Error al obtener secciones públicas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener secciones públicas',
      error: error.message
    });
  }
};

// Obtener secciones principales (sin parent)
exports.getSeccionesPrincipales = async (req, res) => {
  try {
    const secciones = await Seccion.find({
      activo: true,
      visibilidad: 'publica',
      parentSeccion: null
    })
    .sort({ orden: 1 });

    res.status(200).json({
      success: true,
      data: secciones
    });
  } catch (error) {
    console.error('Error al obtener secciones principales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener secciones principales',
      error: error.message
    });
  }
};

// Obtener subsecciones de una sección
exports.getSubsecciones = async (req, res) => {
  try {
    const { id } = req.params;

    const subsecciones = await Seccion.getSubsecciones(id);

    res.status(200).json({
      success: true,
      data: subsecciones
    });
  } catch (error) {
    console.error('Error al obtener subsecciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener subsecciones',
      error: error.message
    });
  }
};

// Obtener una sección por ID
exports.getSeccionById = async (req, res) => {
  try {
    const { id } = req.params;

    const seccion = await Seccion.findById(id)
      .populate('parentSeccion', 'titulo slug');

    if (!seccion) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: seccion
    });
  } catch (error) {
    console.error('Error al obtener sección:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sección',
      error: error.message
    });
  }
};

// Obtener una sección por slug (público)
exports.getSeccionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const seccion = await Seccion.findOne({
      slug,
      activo: true,
      visibilidad: 'publica'
    })
    .populate('parentSeccion', 'titulo slug');

    if (!seccion) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }

    // Obtener subsecciones si existen
    const subsecciones = await Seccion.getSubsecciones(seccion._id);

    // Obtener ruta completa (breadcrumb)
    const rutaCompleta = await seccion.getRutaCompleta();

    res.status(200).json({
      success: true,
      data: {
        ...seccion.toObject(),
        subsecciones,
        rutaCompleta
      }
    });
  } catch (error) {
    console.error('Error al obtener sección por slug:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sección',
      error: error.message
    });
  }
};

// Crear nueva sección
exports.createSeccion = async (req, res) => {
  try {
    const seccionData = { ...req.body };

    // Asignar usuario que crea
    if (req.user) {
      seccionData.createdBy = req.user.id;
    }

    // Si no hay orden, asignar el siguiente número
    if (!seccionData.orden) {
      const ultimaSeccion = await Seccion.findOne().sort({ orden: -1 });
      seccionData.orden = ultimaSeccion ? ultimaSeccion.orden + 1 : 0;
    }

    const nuevaSeccion = new Seccion(seccionData);
    await nuevaSeccion.save();

    res.status(201).json({
      success: true,
      message: 'Sección creada exitosamente',
      data: nuevaSeccion
    });
  } catch (error) {
    console.error('Error al crear sección:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear sección',
      error: error.message
    });
  }
};

// Actualizar sección
exports.updateSeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Asignar usuario que actualiza
    if (req.user) {
      updateData.updatedBy = req.user.id;
    }

    const seccion = await Seccion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!seccion) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sección actualizada exitosamente',
      data: seccion
    });
  } catch (error) {
    console.error('Error al actualizar sección:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar sección',
      error: error.message
    });
  }
};

// Eliminar sección (soft delete)
exports.deleteSeccion = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay subsecciones
    const subsecciones = await Seccion.find({ parentSeccion: id });
    if (subsecciones.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una sección que tiene subsecciones'
      });
    }

    const seccion = await Seccion.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!seccion) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sección eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar sección:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar sección',
      error: error.message
    });
  }
};

// Reordenar secciones
exports.reordenarSecciones = async (req, res) => {
  try {
    const { secciones } = req.body; // Array de { id, orden }

    const promises = secciones.map(({ id, orden }) =>
      Seccion.findByIdAndUpdate(id, { orden })
    );

    await Promise.all(promises);

    res.status(200).json({
      success: true,
      message: 'Secciones reordenadas exitosamente'
    });
  } catch (error) {
    console.error('Error al reordenar secciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reordenar secciones',
      error: error.message
    });
  }
};

// Subir imagen destacada
exports.uploadImagenDestacada = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || !req.files.imagen) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ninguna imagen'
      });
    }

    const imagen = req.files.imagen;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imagen.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG o WEBP'
      });
    }

    // Subir a S3
    const folder = 'secciones/imagenes';
    const result = await uploadToS3(imagen, folder);

    // Actualizar sección
    const seccion = await Seccion.findById(id);
    if (!seccion) {
      await deleteFromS3(result.key); // Eliminar imagen si la sección no existe
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }

    // Eliminar imagen anterior si existe
    if (seccion.imagenDestacada?.key) {
      await deleteFromS3(seccion.imagenDestacada.key);
    }

    seccion.imagenDestacada = {
      url: result.url,
      key: result.key
    };

    await seccion.save();

    res.status(200).json({
      success: true,
      message: 'Imagen destacada subida exitosamente',
      data: seccion.imagenDestacada
    });
  } catch (error) {
    console.error('Error al subir imagen destacada:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imagen destacada',
      error: error.message
    });
  }
};

// Subir archivos a una sección
exports.uploadArchivos = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se han proporcionado archivos'
      });
    }

    const seccion = await Seccion.findById(id);
    if (!seccion) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }

    const archivosSubidos = [];
    const files = Array.isArray(req.files.archivos) ? req.files.archivos : [req.files.archivos];

    for (const file of files) {
      const folder = 'secciones/archivos';
      const result = await uploadToS3(file, folder);

      const archivoData = {
        nombre: file.name,
        url: result.url,
        key: result.key,
        tipo: file.mimetype,
        tamaño: file.size,
        descripcion: req.body.descripcion || ''
      };

      seccion.archivos.push(archivoData);
      archivosSubidos.push(archivoData);
    }

    await seccion.save();

    res.status(200).json({
      success: true,
      message: 'Archivos subidos exitosamente',
      data: archivosSubidos
    });
  } catch (error) {
    console.error('Error al subir archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir archivos',
      error: error.message
    });
  }
};

// Eliminar archivo de una sección
exports.deleteArchivo = async (req, res) => {
  try {
    const { id, archivoId } = req.params;

    const seccion = await Seccion.findById(id);
    if (!seccion) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }

    const archivo = seccion.archivos.id(archivoId);
    if (!archivo) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Eliminar de S3
    await deleteFromS3(archivo.key);

    // Eliminar del array
    archivo.remove();
    await seccion.save();

    res.status(200).json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar archivo',
      error: error.message
    });
  }
};
