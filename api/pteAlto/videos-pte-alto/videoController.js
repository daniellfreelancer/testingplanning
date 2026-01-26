const Video = require('./videoModel');

// Obtener todos los videos (admin)
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ orden: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error al obtener videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener videos',
      error: error.message
    });
  }
};

// Obtener videos activos (público)
exports.getVideosActivos = async (req, res) => {
  try {
    const { limit, offset, categoria } = req.query;

    const query = { activo: true };
    if (categoria) {
      query.categoria = categoria;
    }

    let videosQuery = Video.find(query)
      .sort({ orden: 1, createdAt: -1 });

    if (limit) {
      videosQuery = videosQuery.limit(parseInt(limit));
    }
    if (offset) {
      videosQuery = videosQuery.skip(parseInt(offset));
    }

    const videos = await videosQuery;
    const total = await Video.countDocuments(query);

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        total,
        limit: parseInt(limit) || total,
        offset: parseInt(offset) || 0
      }
    });
  } catch (error) {
    console.error('Error al obtener videos activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener videos',
      error: error.message
    });
  }
};

// Obtener videos destacados
exports.getVideosDestacados = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const videos = await Video.find({ activo: true, destacado: true })
      .sort({ orden: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error al obtener videos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener videos destacados',
      error: error.message
    });
  }
};

// Obtener video por ID
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error al obtener video:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener video',
      error: error.message
    });
  }
};

// Crear video
exports.createVideo = async (req, res) => {
  try {
    const videoData = { ...req.body };

    // Asignar usuario que crea
    if (req.user) {
      videoData.createdBy = req.user.id;
    }

    // Si no hay orden, asignar el siguiente número
    if (!videoData.orden && videoData.orden !== 0) {
      const ultimoVideo = await Video.findOne().sort({ orden: -1 });
      videoData.orden = ultimoVideo ? ultimoVideo.orden + 1 : 0;
    }

    const nuevoVideo = new Video(videoData);
    await nuevoVideo.save();

    res.status(201).json({
      success: true,
      message: 'Video creado exitosamente',
      data: nuevoVideo
    });
  } catch (error) {
    console.error('Error al crear video:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear video',
      error: error.message
    });
  }
};

// Actualizar video
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Asignar usuario que actualiza
    if (req.user) {
      updateData.updatedBy = req.user.id;
    }

    const video = await Video.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video actualizado exitosamente',
      data: video
    });
  } catch (error) {
    console.error('Error al actualizar video:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar video',
      error: error.message
    });
  }
};

// Eliminar video (soft delete)
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar video:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar video',
      error: error.message
    });
  }
};

// Eliminar video permanentemente
exports.deleteVideoPermanente = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video eliminado permanentemente'
    });
  } catch (error) {
    console.error('Error al eliminar video:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar video',
      error: error.message
    });
  }
};

// Reordenar videos
exports.reordenarVideos = async (req, res) => {
  try {
    const { videos } = req.body; // Array de { id, orden }

    const promises = videos.map(({ id, orden }) =>
      Video.findByIdAndUpdate(id, { orden })
    );

    await Promise.all(promises);

    res.status(200).json({
      success: true,
      message: 'Videos reordenados exitosamente'
    });
  } catch (error) {
    console.error('Error al reordenar videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reordenar videos',
      error: error.message
    });
  }
};

// Incrementar vistas
exports.incrementarVistas = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByIdAndUpdate(
      id,
      { $inc: { vistas: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error al incrementar vistas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al incrementar vistas',
      error: error.message
    });
  }
};