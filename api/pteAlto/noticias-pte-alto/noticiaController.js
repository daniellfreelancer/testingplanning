const Noticia = require('./noticiaModel');
const { uploadFile, uploadMultipleFiles, deleteFile, invalidateCloudFrontCache } = require('../../../utils/s3CloudFront');

/**
 * Obtener todas las noticias (Admin)
 */
exports.getAllNoticias = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      estado = '',
      destacada = '',
      categoria = ''
    } = req.query;

    const query = {};

    // Filtros
    if (search) {
      query.$or = [
        { titulo: { $regex: search, $options: 'i' } },
        { resumen: { $regex: search, $options: 'i' } }
      ];
    }

    if (estado) {
      query.estado = estado;
    }

    if (destacada !== '') {
      query.destacada = destacada === 'true';
    }

    if (categoria) {
      query.categoria = categoria;
    }

    if (req.user.institucionId) {
      query.institucionId = req.user.institucionId;
    }

    const skip = (page - 1) * limit;

    const noticias = await Noticia.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    const total = await Noticia.countDocuments(query);

    res.status(200).json({
      success: true,
      data: noticias,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo noticias:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener noticias públicas (sin autenticación)
 */
exports.getNoticiasPublicas = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      destacada = '',
      categoria = ''
    } = req.query;

    const query = {
      estado: 'publicada',
      publicada: true
    };

    if (destacada !== '') {
      query.destacada = destacada === 'true';
    }

    if (categoria) {
      query.categoria = categoria;
    }

    const skip = (page - 1) * limit;

    const noticias = await Noticia.find(query)
      .sort({ fechaPublicacion: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-createdBy -updatedBy');

    const total = await Noticia.countDocuments(query);

    res.status(200).json({
      success: true,
      data: noticias,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo noticias públicas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener noticias destacadas
 */
exports.getNoticiasDestacadas = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const noticias = await Noticia.find({
      estado: 'publicada',
      publicada: true,
      destacada: true
    })
      .sort({ orden: 1, fechaPublicacion: -1 })
      .limit(parseInt(limit))
      .select('-createdBy -updatedBy');

    res.status(200).json({
      success: true,
      data: noticias
    });
  } catch (error) {
    console.error('Error obteniendo noticias destacadas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener noticia por ID
 */
exports.getNoticiaById = async (req, res) => {
  try {
    const { id } = req.params;

    const noticia = await Noticia.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!noticia) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: noticia
    });
  } catch (error) {
    console.error('Error obteniendo noticia:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener noticia por slug (público)
 */
exports.getNoticiaBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const noticia = await Noticia.findOne({
      slug,
      estado: 'publicada',
      publicada: true
    }).select('-createdBy -updatedBy');

    if (!noticia) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    // Incrementar vistas
    await noticia.incrementViews();

    res.status(200).json({
      success: true,
      data: noticia
    });
  } catch (error) {
    console.error('Error obteniendo noticia por slug:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Crear noticia
 */
exports.createNoticia = async (req, res) => {
  try {
    const {
      titulo,
      slug,
      resumen,
      contenido,
      categoria,
      estado,
      destacada,
      publicada,
      fechaPublicacion,
      urlExterna,
      redirigirExterna,
      notificarUsuarios,
      orden
    } = req.body;

    // Generar slug único si no se proporciona
    const slugFinal = slug || await Noticia.generateUniqueSlug(titulo);

    // Subir imagen principal si existe
    let imagenPrincipal = null;
    if (req.files && req.files.imagenPrincipal) {
      const result = await uploadFile(req.files.imagenPrincipal, {
        category: 'noticias',
        optimize: true,
        optimizeOptions: {
          maxWidth: 1920,
          quality: 85,
          format: 'jpeg'
        }
      });

      imagenPrincipal = {
        url: result.cloudFrontUrl,
        key: result.key
      };
    }

    // Crear noticia
    const noticia = new Noticia({
      titulo,
      slug: slugFinal,
      resumen,
      contenido,
      imagenPrincipal,
      categoria,
      estado: estado || 'borrador',
      destacada: destacada === 'true' || destacada === true,
      publicada: publicada === 'true' || publicada === true,
      fechaPublicacion: fechaPublicacion || Date.now(),
      urlExterna,
      redirigirExterna: redirigirExterna === 'true' || redirigirExterna === true,
      notificarUsuarios: notificarUsuarios === 'true' || notificarUsuarios === true,
      orden: orden || 0,
      institucionId: req.user.institucionId,
      createdBy: req.user._id
    });

    await noticia.save();

    // TODO: Implementar notificación push si notificarUsuarios es true
    if (noticia.notificarUsuarios && noticia.publicada) {
      // Enviar notificación a usuarios de app móvil
      console.log('TODO: Enviar notificación push para noticia:', noticia._id);
    }

    res.status(201).json({
      success: true,
      data: noticia
    });
  } catch (error) {
    console.error('Error creando noticia:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Actualizar noticia
 */
exports.updateNoticia = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      slug,
      resumen,
      contenido,
      categoria,
      estado,
      destacada,
      publicada,
      fechaPublicacion,
      urlExterna,
      redirigirExterna,
      notificarUsuarios,
      orden
    } = req.body;

    const noticia = await Noticia.findById(id);

    if (!noticia) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    // Actualizar slug si cambió el título
    if (titulo && titulo !== noticia.titulo) {
      const nuevoSlug = slug || await Noticia.generateUniqueSlug(titulo, id);
      noticia.slug = nuevoSlug;
    } else if (slug) {
      noticia.slug = slug;
    }

    // Actualizar imagen principal si se proporciona nueva
    if (req.files && req.files.imagenPrincipal) {
      // Eliminar imagen anterior
      if (noticia.imagenPrincipal?.key) {
        try {
          await deleteFile(noticia.imagenPrincipal.key);
          await invalidateCloudFrontCache(`/${noticia.imagenPrincipal.key}`);
        } catch (error) {
          console.error('Error eliminando imagen anterior:', error);
        }
      }

      // Subir nueva imagen
      const result = await uploadFile(req.files.imagenPrincipal, {
        category: 'noticias',
        optimize: true,
        optimizeOptions: {
          maxWidth: 1920,
          quality: 85,
          format: 'jpeg'
        }
      });

      noticia.imagenPrincipal = {
        url: result.cloudFrontUrl,
        key: result.key
      };
    }

    // Actualizar campos
    if (titulo) noticia.titulo = titulo;
    if (resumen !== undefined) noticia.resumen = resumen;
    if (contenido) noticia.contenido = contenido;
    if (categoria) noticia.categoria = categoria;
    if (estado) noticia.estado = estado;
    if (destacada !== undefined) noticia.destacada = destacada === 'true' || destacada === true;
    if (publicada !== undefined) noticia.publicada = publicada === 'true' || publicada === true;
    if (fechaPublicacion) noticia.fechaPublicacion = fechaPublicacion;
    if (urlExterna !== undefined) noticia.urlExterna = urlExterna;
    if (redirigirExterna !== undefined) noticia.redirigirExterna = redirigirExterna === 'true' || redirigirExterna === true;
    if (notificarUsuarios !== undefined) noticia.notificarUsuarios = notificarUsuarios === 'true' || notificarUsuarios === true;
    if (orden !== undefined) noticia.orden = orden;

    noticia.updatedBy = req.user._id;

    await noticia.save();

    // TODO: Implementar notificación push si notificarUsuarios es true
    if (noticia.notificarUsuarios && noticia.publicada) {
      console.log('TODO: Enviar notificación push para noticia actualizada:', noticia._id);
    }

    res.status(200).json({
      success: true,
      data: noticia
    });
  } catch (error) {
    console.error('Error actualizando noticia:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Eliminar noticia
 */
exports.deleteNoticia = async (req, res) => {
  try {
    const { id } = req.params;

    const noticia = await Noticia.findById(id);

    if (!noticia) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    // Eliminar archivos de S3
    const keysToDelete = [];

    if (noticia.imagenPrincipal?.key) {
      keysToDelete.push(noticia.imagenPrincipal.key);
    }

    if (noticia.imagenes && noticia.imagenes.length > 0) {
      noticia.imagenes.forEach(img => {
        if (img.key) keysToDelete.push(img.key);
      });
    }

    if (keysToDelete.length > 0) {
      try {
        const { deleteMultipleFiles, invalidateCloudFrontCache } = require('../utils/s3CloudFront');
        await deleteMultipleFiles(keysToDelete);
        await invalidateCloudFrontCache(keysToDelete.map(k => `/${k}`));
      } catch (error) {
        console.error('Error eliminando archivos de S3:', error);
      }
    }

    await noticia.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Noticia eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando noticia:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Toggle destacada
 */
exports.toggleDestacada = async (req, res) => {
  try {
    const { id } = req.params;

    const noticia = await Noticia.findById(id);

    if (!noticia) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    noticia.destacada = !noticia.destacada;
    noticia.updatedBy = req.user._id;
    await noticia.save();

    res.status(200).json({
      success: true,
      data: noticia
    });
  } catch (error) {
    console.error('Error actualizando destacada:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Agregar imágenes adicionales a la noticia
 */
exports.addImagenes = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || !req.files.imagenes) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron imágenes'
      });
    }

    const noticia = await Noticia.findById(id);

    if (!noticia) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    const imagenesArray = Array.isArray(req.files.imagenes)
      ? req.files.imagenes
      : [req.files.imagenes];

    const results = await uploadMultipleFiles(imagenesArray, {
      category: 'noticias',
      optimize: true,
      optimizeOptions: {
        maxWidth: 1920,
        quality: 80
      }
    });

    const nuevasImagenes = results.map(result => ({
      url: result.cloudFrontUrl,
      key: result.key
    }));

    noticia.imagenes.push(...nuevasImagenes);
    noticia.updatedBy = req.user._id;
    await noticia.save();

    res.status(200).json({
      success: true,
      data: noticia
    });
  } catch (error) {
    console.error('Error agregando imágenes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Eliminar imagen adicional
 */
exports.deleteImagen = async (req, res) => {
  try {
    const { id, imagenId } = req.params;

    const noticia = await Noticia.findById(id);

    if (!noticia) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    const imagen = noticia.imagenes.id(imagenId);

    if (!imagen) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada'
      });
    }

    // Eliminar de S3
    if (imagen.key) {
      try {
        await deleteFile(imagen.key);
        await invalidateCloudFrontCache(`/${imagen.key}`);
      } catch (error) {
        console.error('Error eliminando imagen de S3:', error);
      }
    }

    noticia.imagenes.pull(imagenId);
    noticia.updatedBy = req.user._id;
    await noticia.save();

    res.status(200).json({
      success: true,
      data: noticia
    });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = exports;
