const NavItem = require('../models/navItem');

/**
 * Obtener todos los nav items (Admin)
 */
exports.getAllNavItems = async (req, res) => {
  try {
    const { institucionId } = req.query;

    const query = {};
    if (institucionId) {
      query.institucionId = institucionId;
    }

    const navItems = await NavItem.find(query)
      .sort({ orden: 1 });

    res.status(200).json({
      success: true,
      data: navItems
    });
  } catch (error) {
    console.error('Error obteniendo nav items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener nav items activos (Público)
 */
exports.getNavItemsActivos = async (req, res) => {
  try {
    const { institucionId } = req.query;

    const query = { activo: true };
    if (institucionId) {
      query.institucionId = institucionId;
    }

    const navItems = await NavItem.find(query)
      .sort({ orden: 1 })
      .select('label href icono descripcion esExterno abrirNuevaVentana orden');

    res.status(200).json({
      success: true,
      data: navItems
    });
  } catch (error) {
    console.error('Error obteniendo nav items activos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener nav item por ID
 */
exports.getNavItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const navItem = await NavItem.findById(id);

    if (!navItem) {
      return res.status(404).json({
        success: false,
        error: 'Nav item no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: navItem
    });
  } catch (error) {
    console.error('Error obteniendo nav item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Crear nav item
 */
exports.createNavItem = async (req, res) => {
  try {
    const {
      label,
      href,
      orden,
      activo,
      tipo,
      icono,
      descripcion,
      esExterno,
      abrirNuevaVentana,
      institucionId
    } = req.body;

    const navItem = new NavItem({
      label,
      href,
      orden: orden || 0,
      activo: activo !== undefined ? activo : true,
      tipo: tipo || 'personalizado',
      icono,
      descripcion,
      esExterno: esExterno || false,
      abrirNuevaVentana: abrirNuevaVentana || false,
      institucionId: institucionId || req.user?.institucionId || null,
      createdBy: req.user?._id || null
    });

    await navItem.save();

    res.status(201).json({
      success: true,
      data: navItem
    });
  } catch (error) {
    console.error('Error creando nav item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Actualizar nav item
 */
exports.updateNavItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      label,
      href,
      orden,
      activo,
      icono,
      descripcion,
      esExterno,
      abrirNuevaVentana
    } = req.body;

    const navItem = await NavItem.findById(id);

    if (!navItem) {
      return res.status(404).json({
        success: false,
        error: 'Nav item no encontrado'
      });
    }

    // No permitir editar items predefinidos (solo activo/orden)
    if (navItem.tipo === 'predefinido') {
      if (activo !== undefined) navItem.activo = activo;
      if (orden !== undefined) navItem.orden = orden;
    } else {
      // Actualizar todos los campos para items personalizados
      if (label) navItem.label = label;
      if (href) navItem.href = href;
      if (orden !== undefined) navItem.orden = orden;
      if (activo !== undefined) navItem.activo = activo;
      if (icono !== undefined) navItem.icono = icono;
      if (descripcion !== undefined) navItem.descripcion = descripcion;
      if (esExterno !== undefined) navItem.esExterno = esExterno;
      if (abrirNuevaVentana !== undefined) navItem.abrirNuevaVentana = abrirNuevaVentana;
    }

    navItem.updatedBy = req.user?._id || null;
    await navItem.save();

    res.status(200).json({
      success: true,
      data: navItem
    });
  } catch (error) {
    console.error('Error actualizando nav item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Eliminar nav item
 */
exports.deleteNavItem = async (req, res) => {
  try {
    const { id } = req.params;

    const navItem = await NavItem.findById(id);

    if (!navItem) {
      return res.status(404).json({
        success: false,
        error: 'Nav item no encontrado'
      });
    }

    // No permitir eliminar items predefinidos
    if (navItem.tipo === 'predefinido') {
      return res.status(403).json({
        success: false,
        error: 'No se pueden eliminar items predefinidos. Solo se pueden desactivar.'
      });
    }

    await navItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Nav item eliminado correctamente'
    });
  } catch (error) {
    console.error('Error eliminando nav item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Reordenar nav items
 */
exports.reorderNavItems = async (req, res) => {
  try {
    const { items } = req.body; // Array de { id, orden }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de items'
      });
    }

    const updatePromises = items.map(({ id, orden }) =>
      NavItem.findByIdAndUpdate(id, { orden, updatedBy: req.user?._id })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Items reordenados correctamente'
    });
  } catch (error) {
    console.error('Error reordenando nav items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Inicializar nav items predefinidos
 */
exports.initializeDefaultNavItems = async (req, res) => {
  try {
    const defaultItems = [
      {
        label: 'Inicio',
        href: '/',
        orden: 0,
        activo: true,
        tipo: 'predefinido',
        icono: 'Home',
        descripcion: 'Página principal'
      },
      {
        label: 'Noticias',
        href: '/noticias',
        orden: 1,
        activo: true,
        tipo: 'predefinido',
        icono: 'Newspaper',
        descripcion: 'Noticias deportivas'
      },
      {
        label: 'Agendar',
        href: '/agendamiento',
        orden: 2,
        activo: true,
        tipo: 'predefinido',
        icono: 'Calendar',
        descripcion: 'Agendar actividades'
      },
      {
        label: 'Iniciar Sesión',
        href: '/login',
        orden: 3,
        activo: true,
        tipo: 'predefinido',
        icono: 'LogIn',
        descripcion: 'Acceso al sistema'
      }
    ];

    // Verificar si ya existen items predefinidos
    const existingCount = await NavItem.countDocuments({ tipo: 'predefinido' });

    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Los items predefinidos ya han sido inicializados'
      });
    }

    const createdItems = await NavItem.insertMany(defaultItems);

    res.status(201).json({
      success: true,
      data: createdItems,
      message: 'Items predefinidos inicializados correctamente'
    });
  } catch (error) {
    console.error('Error inicializando nav items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = exports;
