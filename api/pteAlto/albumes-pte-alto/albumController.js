const Album = require('./albumModel');
const { uploadFile, deleteFile } = require('../../../utils/s3CloudFront');

// Obtener todos los álbumes (admin)
exports.getAllAlbumes = async (req, res) => {
  try {
    const albumes = await Album.find().sort({ orden: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: albumes
    });
  } catch (error) {
    console.error('Error al obtener álbumes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener álbumes',
      error: error.message
    });
  }
};

// Obtener álbumes públicos
exports.getAlbumesPublicos = async (req, res) => {
  try {
    const { limit, offset } = req.query;

    const query = { publico: true, activo: true };

    let albumesQuery = Album.find(query)
      .sort({ orden: 1, createdAt: -1 })


    if (limit) {
      albumesQuery = albumesQuery.limit(parseInt(limit));
    }
    if (offset) {
      albumesQuery = albumesQuery.skip(parseInt(offset));
    }

    const albumes = await albumesQuery;
    const total = await Album.countDocuments(query);

    // Mapear álbumes para incluir totalImagenes y excluir las imágenes completas
    const albumesConTotal = albumes.map(album => {
      const albumObj = album.toObject();
      albumObj.totalImagenes = album.imagenes ? album.imagenes.length : 0;
      delete albumObj.imagenes; // No enviar todas las imágenes
      return albumObj;
    });

    res.status(200).json({
      success: true,
      data: albumesConTotal,
      pagination: {
        total,
        limit: parseInt(limit) || total,
        offset: parseInt(offset) || 0
      }
    });
  } catch (error) {
    console.error('Error al obtener álbumes públicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener álbumes públicos',
      error: error.message
    });
  }
};

// Obtener un álbum por ID
exports.getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findById(id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: album
    });
  } catch (error) {
    console.error('Error al obtener álbum:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener álbum',
      error: error.message
    });
  }
};

// Obtener un álbum por slug (público)
exports.getAlbumBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const album = await Album.findOne({
      slug,
      publico: true,
      activo: true
    });

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    // Incrementar vistas
    album.vistas += 1;
    await album.save();

    res.status(200).json({
      success: true,
      data: album
    });
  } catch (error) {
    console.error('Error al obtener álbum por slug:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener álbum',
      error: error.message
    });
  }
};

// Crear nuevo álbum
exports.createAlbum = async (req, res) => {
  try {
    const albumData = { ...req.body };

    // Generar slug único
    if (albumData.nombre) {
      albumData.slug = await Album.generateUniqueSlug(albumData.nombre);
    }

    // Asignar usuario que crea
    if (req.user) {
      albumData.createdBy = req.user.id;
    }

    // Si no hay orden, asignar el siguiente número
    if (!albumData.orden && albumData.orden !== 0) {
      const ultimoAlbum = await Album.findOne().sort({ orden: -1 });
      albumData.orden = ultimoAlbum ? ultimoAlbum.orden + 1 : 0;
    }

    const nuevoAlbum = new Album(albumData);
    await nuevoAlbum.save();

    // Si se enviaron imágenes, procesarlas
    if (req.files && req.files.imagenes) {
      const carpeta = nuevoAlbum.getCarpetaS3();
      const imagenesSubidas = [];
      const files = Array.isArray(req.files.imagenes)
        ? req.files.imagenes
        : [req.files.imagenes];

      for (const file of files) {
        // Validar que sea imagen
        if (!file.mimetype.startsWith('image/')) {
          continue;
        }

        // Subir a S3 en la carpeta del álbum
        const result = await uploadFile(file, { category: carpeta });

        const imagenData = {
          url: result.url,
          key: result.key,
          nombre: file.name,
          descripcion: '',
          orden: nuevoAlbum.imagenes.length + imagenesSubidas.length,
          tamaño: file.size
        };

        nuevoAlbum.imagenes.push(imagenData);
        imagenesSubidas.push(imagenData);
      }

      // Establecer primera imagen como portada
      if (imagenesSubidas.length > 0) {
        nuevoAlbum.imagenPortada = imagenesSubidas[0].url;
      }

      await nuevoAlbum.save();
    }

    res.status(201).json({
      success: true,
      message: 'Álbum creado exitosamente',
      data: nuevoAlbum
    });
  } catch (error) {
    console.error('Error al crear álbum:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear álbum',
      error: error.message
    });
  }
};

// Actualizar álbum
exports.updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Asignar usuario que actualiza
    if (req.user) {
      updateData.updatedBy = req.user.id;
    }

    const album = await Album.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Álbum actualizado exitosamente',
      data: album
    });
  } catch (error) {
    console.error('Error al actualizar álbum:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar álbum',
      error: error.message
    });
  }
};

// Eliminar álbum (soft delete)
exports.deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Álbum eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar álbum:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar álbum',
      error: error.message
    });
  }
};

// Eliminar álbum permanentemente (con todas sus imágenes de S3)
exports.deleteAlbumPermanente = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    // Eliminar todas las imágenes de S3
    const deletePromises = album.imagenes.map(imagen =>
      deleteFile(imagen.key)
    );
    await Promise.all(deletePromises);

    // Eliminar el álbum de la base de datos
    await Album.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Álbum y todas sus imágenes eliminados permanentemente'
    });
  } catch (error) {
    console.error('Error al eliminar álbum permanentemente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar álbum',
      error: error.message
    });
  }
};

// Reordenar álbumes
exports.reordenarAlbumes = async (req, res) => {
  try {
    const { albumes } = req.body; // Array de { id, orden }

    const promises = albumes.map(({ id, orden }) =>
      Album.findByIdAndUpdate(id, { orden })
    );

    await Promise.all(promises);

    res.status(200).json({
      success: true,
      message: 'Álbumes reordenados exitosamente'
    });
  } catch (error) {
    console.error('Error al reordenar álbumes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reordenar álbumes',
      error: error.message
    });
  }
};

// Subir imágenes al álbum (masivo o individual)
exports.uploadImagenes = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se han proporcionado imágenes'
      });
    }

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    // Carpeta específica para este álbum
    const carpeta = album.getCarpetaS3();

    const imagenesSubidas = [];
    const files = Array.isArray(req.files.imagenes)
      ? req.files.imagenes
      : [req.files.imagenes];

    for (const file of files) {
      // Validar que sea imagen
      if (!file.mimetype.startsWith('image/')) {
        continue;
      }

      // Subir a S3 en la carpeta del álbum
      const result = await uploadFile(file, { category: carpeta });

      const imagenData = {
        url: result.url,
        key: result.key,
        nombre: file.name,
        descripcion: req.body.descripcion || '',
        orden: album.imagenes.length + imagenesSubidas.length,
        tamaño: file.size
      };

      album.imagenes.push(imagenData);
      imagenesSubidas.push(imagenData);
    }

    // Actualizar imagen de portada si es el primer lote
    if (album.imagenes.length === imagenesSubidas.length && imagenesSubidas.length > 0) {
      album.imagenPortada = imagenesSubidas[0].url;
    }

    await album.save();

    res.status(200).json({
      success: true,
      message: `${imagenesSubidas.length} imagen(es) subida(s) exitosamente`,
      data: {
        album: album,
        imagenesSubidas: imagenesSubidas
      }
    });
  } catch (error) {
    console.error('Error al subir imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imágenes',
      error: error.message
    });
  }
};

// Eliminar una imagen específica del álbum
exports.deleteImagen = async (req, res) => {
  try {
    const { id, imagenId } = req.params;

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    const imagen = album.imagenes.id(imagenId);
    if (!imagen) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Eliminar de S3
    await deleteFile(imagen.key);

    // Eliminar del array
    imagen.remove();

    // Actualizar imagen de portada si era la primera
    if (album.imagenPortada === imagen.url && album.imagenes.length > 0) {
      album.imagenPortada = album.imagenes[0].url;
    }

    await album.save();

    res.status(200).json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen',
      error: error.message
    });
  }
};

// Reordenar imágenes dentro de un álbum
exports.reordenarImagenes = async (req, res) => {
  try {
    const { id } = req.params;
    const { imagenes } = req.body; // Array de { _id, orden }

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    // Actualizar orden de cada imagen
    imagenes.forEach(({ _id, orden }) => {
      const imagen = album.imagenes.id(_id);
      if (imagen) {
        imagen.orden = orden;
      }
    });

    await album.save();

    res.status(200).json({
      success: true,
      message: 'Imágenes reordenadas exitosamente'
    });
  } catch (error) {
    console.error('Error al reordenar imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reordenar imágenes',
      error: error.message
    });
  }
};

// Actualizar información de una imagen
exports.updateImagen = async (req, res) => {
  try {
    const { id, imagenId } = req.params;
    const { nombre, descripcion } = req.body;

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    const imagen = album.imagenes.id(imagenId);
    if (!imagen) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    if (nombre) imagen.nombre = nombre;
    if (descripcion !== undefined) imagen.descripcion = descripcion;

    await album.save();

    res.status(200).json({
      success: true,
      message: 'Imagen actualizada exitosamente',
      data: imagen
    });
  } catch (error) {
    console.error('Error al actualizar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar imagen',
      error: error.message
    });
  }
};

// Establecer imagen de portada
exports.setImagenPortada = async (req, res) => {
  try {
    const { id, imagenId } = req.params;

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    const imagen = album.imagenes.id(imagenId);
    if (!imagen) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    album.imagenPortada = imagen.url;
    await album.save();

    res.status(200).json({
      success: true,
      message: 'Imagen de portada actualizada',
      data: album
    });
  } catch (error) {
    console.error('Error al establecer imagen de portada:', error);
    res.status(500).json({
      success: false,
      message: 'Error al establecer imagen de portada',
      error: error.message
    });
  }
};
