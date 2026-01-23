# Guía Completa: AWS S3 + CloudFront

## 📋 Índice

1. [Configuración AWS](#configuración-aws)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Configuración del Proyecto](#configuración-del-proyecto)
4. [Uso Básico](#uso-básico)
5. [Ejemplos por Categoría](#ejemplos-por-categoría)
6. [Migración de URLs Existentes](#migración-de-urls-existentes)
7. [Optimización de Costos](#optimización-de-costos)
8. [Troubleshooting](#troubleshooting)

---

## Configuración AWS

### 1. Configurar S3 Bucket

```bash
# Nombre del bucket
vm-media-storage

# Región
us-east-1

# Configuración:
- ✅ Block all public access: OFF (para imágenes públicas)
- ✅ Versioning: Enabled (opcional)
- ✅ Server-side encryption: Enabled (AES-256)
```

### 2. Configurar CloudFront Distribution

**Origin Settings:**
```
Origin Domain: vm-media-storage.s3.us-east-1.amazonaws.com
Origin Path: /linkaws (opcional, si solo quieres CDN para esta carpeta)
Origin Access: Public
```

**Behavior Settings:**
```
Viewer Protocol Policy: Redirect HTTP to HTTPS
Allowed HTTP Methods: GET, HEAD, OPTIONS
Cache Policy: CachingOptimized
```

**Cache Settings:**
```
TTL Settings:
- Minimum: 0
- Maximum: 31536000 (1 año)
- Default: 86400 (1 día)
```

**Distribution Settings:**
```
Price Class: Use All Edge Locations (mejor rendimiento)
            o Use Only North America and Europe (menor costo)
Alternate Domain Names (CNAMEs): media.tudominio.com (opcional)
SSL Certificate: Default CloudFront Certificate
```

### 3. Obtener URL de CloudFront

Después de crear la distribución, obtendrás una URL como:
```
https://d1234567890abc.cloudfront.net
```

---

## Estructura de Carpetas en S3

Todas las carpetas se organizan bajo el prefijo `linkaws/`:

```
vm-media-storage/
└── linkaws/
    ├── galeria/           # Fotos de galerías y álbumes
    │   ├── 2025/
    │   │   ├── 01/
    │   │   │   ├── 1737584123-abc123.jpg
    │   │   │   └── 1737584456-def456.jpg
    │   │   └── 02/
    │   └── 2024/
    │
    ├── noticias/          # Imágenes de noticias
    │   ├── 2025/
    │   │   └── 01/
    │   │       ├── 1737584789-xyz789.jpg
    │   │       └── 1737585012-uvw012.jpg
    │   └── 2024/
    │
    ├── eventos/           # Imágenes de eventos
    │   ├── 2025/
    │   └── 2024/
    │
    ├── videos/            # Thumbnails de videos (YouTube)
    │   ├── 2025/
    │   └── 2024/
    │
    ├── documentos/        # PDFs, DOCX, etc
    │   ├── 2025/
    │   └── 2024/
    │
    ├── avatares/          # Fotos de perfil de usuarios
    │   ├── 2025/
    │   └── 2024/
    │
    ├── thumbnails/        # Miniaturas generadas automáticamente
    │   ├── 2025/
    │   └── 2024/
    │
    └── general/           # Otros archivos misceláneos
        ├── 2025/
        └── 2024/
```

**Ventajas de esta estructura:**
- ✅ Fácil localizar archivos por categoría y fecha
- ✅ Simplifica la gestión de lifecycle policies
- ✅ Facilita análisis de costos por categoría
- ✅ Permite invalidaciones de cache específicas

---

## Configuración del Proyecto

### 1. Variables de Entorno (.env)

```bash
# AWS S3
AWS_BUCKET_NAME="vm-media-storage"
AWS_BUCKET_REGION="us-east-1"
AWS_PUBLIC_KEY="TU_ACCESS_KEY_ID"
AWS_SECRET_KEY="TU_SECRET_ACCESS_KEY"

# AWS CloudFront
AWS_CLOUDFRONT_DOMAIN="https://d1234567890abc.cloudfront.net"
AWS_CLOUDFRONT_DISTRIBUTION_ID="E1234567890ABC"
```

### 2. Instalar Dependencias

```bash
npm install @aws-sdk/client-s3 @aws-sdk/client-cloudfront sharp
```

### 3. Importar la Utilidad

```javascript
const {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  invalidateCloudFrontCache,
  generateThumbnails,
} = require('./utils/s3CloudFront');
```

---

## Uso Básico

### Subir una Imagen Simple

```javascript
const result = await uploadFile(req.files.image, {
  category: 'eventos', // Carpeta donde se guardará
  optimize: true,
  optimizeOptions: {
    maxWidth: 1920,
    quality: 85,
  },
});

console.log(result);
// {
//   key: 'linkaws/eventos/2025/01/1737584123-abc123.jpg',
//   cloudFrontUrl: 'https://d123.cloudfront.net/linkaws/eventos/2025/01/1737584123-abc123.jpg',
//   s3Url: 'https://vm-media-storage.s3.amazonaws.com/linkaws/eventos/2025/01/1737584123-abc123.jpg',
//   url: 'https://d123.cloudfront.net/linkaws/eventos/2025/01/1737584123-abc123.jpg',
//   size: 245678,
//   contentType: 'image/jpeg'
// }
```

### Guardar en Base de Datos

```javascript
const noticia = new Noticia({
  titulo: 'Nueva noticia',
  imagenDestacada: result.cloudFrontUrl, // URL de CloudFront
  imagenKey: result.key, // Key de S3 (para eliminar después)
});

await noticia.save();
```

---

## Ejemplos por Categoría

### 📰 Noticias

```javascript
// Subir imagen destacada de noticia
const imagenDestacada = await uploadFile(req.files.imagenDestacada, {
  category: 'noticias',
  optimize: true,
  optimizeOptions: {
    maxWidth: 1920,
    quality: 85,
    format: 'jpeg',
  },
});

// Subir galería de imágenes de la noticia
const imagenesGaleria = await uploadMultipleFiles(req.files.imagenes, {
  category: 'noticias',
  optimize: true,
});

const noticia = new Noticia({
  titulo: 'Nueva noticia',
  imagenDestacada: imagenDestacada.cloudFrontUrl,
  imagenKey: imagenDestacada.key,
  imagenes: imagenesGaleria.map(img => ({
    url: img.cloudFrontUrl,
    key: img.key,
  })),
});
```

### 📅 Eventos

```javascript
const imagenEvento = await uploadFile(req.files.imagen, {
  category: 'eventos',
  optimize: true,
  optimizeOptions: {
    maxWidth: 1600,
    quality: 80,
  },
});

const evento = new Evento({
  titulo: 'Torneo de Fútbol',
  imagen: imagenEvento.cloudFrontUrl,
  imagenKey: imagenEvento.key,
});
```

### 🖼️ Galería de Fotos

```javascript
// Crear álbum con portada
const portada = await uploadFile(req.files.imagenPortada, {
  category: 'galeria',
  optimize: true,
});

const album = new Album({
  titulo: 'Campeonato 2025',
  imagenPortada: portada.cloudFrontUrl,
  imagenPortadaKey: portada.key,
});

await album.save();

// Agregar fotos al álbum
const fotos = await uploadMultipleFiles(req.files.imagenes, {
  category: 'galeria',
  optimize: true,
  optimizeOptions: {
    maxWidth: 1920,
    quality: 80,
  },
});

album.imagenes = fotos.map(foto => ({
  url: foto.cloudFrontUrl,
  key: foto.key,
}));

await album.save();
```

### 🎥 Videos (Thumbnails)

```javascript
// Los videos de YouTube no se suben, pero puedes guardar thumbnails personalizados
const thumbnail = await uploadFile(req.files.thumbnail, {
  category: 'videos',
  optimize: true,
  optimizeOptions: {
    maxWidth: 1280,
    quality: 80,
  },
});

const video = new Video({
  titulo: 'Resumen del torneo',
  youtubeUrl: 'https://youtube.com/watch?v=...',
  thumbnailCustom: thumbnail.cloudFrontUrl,
  thumbnailKey: thumbnail.key,
});
```

### 📄 Documentos

```javascript
const documento = await uploadFile(req.files.documento, {
  category: 'documentos',
  optimize: false, // No optimizar PDFs/DOCX
  cacheControl: 'max-age=86400', // Cache 1 día
});

const reglamento = new Documento({
  titulo: 'Reglamento Oficial',
  tipo: 'pdf',
  url: documento.cloudFrontUrl,
  key: documento.key,
});
```

### 👤 Avatares de Usuario

```javascript
const avatar = await uploadFile(req.files.avatar, {
  category: 'avatares',
  optimize: true,
  optimizeOptions: {
    maxWidth: 500,
    maxHeight: 500,
    quality: 85,
  },
});

// Generar thumbnails del avatar
const thumbnails = await generateThumbnails(req.files.avatar, [
  { width: 150, height: 150, suffix: 'thumb' },
  { width: 300, height: 300, suffix: 'medium' },
]);

const usuario = await Usuario.findById(userId);
usuario.avatar = avatar.cloudFrontUrl;
usuario.avatarKey = avatar.key;
usuario.avatarThumb = thumbnails[0].cloudFrontUrl;
await usuario.save();
```

---

## Migración de URLs Existentes

### Paso 1: Agregar Variables de Entorno

Asegúrate de tener configuradas las variables de CloudFront:

```bash
AWS_CLOUDFRONT_DOMAIN="https://d1234567890abc.cloudfront.net"
AWS_CLOUDFRONT_DISTRIBUTION_ID="E1234567890ABC"
```

### Paso 2: Ejecutar Script de Migración

```bash
cd Backend/testingplanning
node scripts/migrateToCloudFront.js
```

Este script:
1. ✅ Conecta a MongoDB
2. ✅ Busca todas las URLs de S3 directo
3. ✅ Las convierte a URLs de CloudFront
4. ✅ Actualiza los documentos en la base de datos

### Paso 3: Verificar Migración

```javascript
// Antes
"imagen": "https://vm-media-storage.s3.us-east-1.amazonaws.com/imagen.jpg"

// Después
"imagen": "https://d1234567890abc.cloudfront.net/linkaws/galeria/2025/01/imagen.jpg"
```

---

## Optimización de Costos

### 1. Comparación de Costos (us-east-1)

**S3 Transferencia Directa:**
- Primeros 10 TB: $0.09/GB = **$90/TB**
- Siguientes 40 TB: $0.085/GB = **$85/TB**

**CloudFront:**
- Primeros 10 TB: $0.085/GB = **$85/TB**
- Siguientes 40 TB: $0.080/GB = **$80/TB**
- **Cache hits:** $0/GB (gratis!) 🎉

**Ejemplo con 5 TB/mes y 80% cache hit rate:**
```
S3 Directo:
5 TB × $90 = $450/mes

CloudFront:
1 TB (cache miss) × $85 = $85/mes
4 TB (cache hit) × $0 = $0/mes
Total: $85/mes

Ahorro: $365/mes (81% de reducción!)
```

### 2. Configurar S3 Lifecycle Policies

```javascript
// Mover archivos antiguos a S3 Glacier después de 90 días
{
  "Rules": [{
    "Id": "MoveOldMediaToGlacier",
    "Prefix": "linkaws/",
    "Status": "Enabled",
    "Transitions": [{
      "Days": 90,
      "StorageClass": "GLACIER"
    }]
  }]
}
```

### 3. Configurar CloudFront Caching

En tu distribución de CloudFront:
- **Cache Based on Selected Request Headers:** None
- **Query String Forwarding:** None
- **TTL Máximo:** 31536000 (1 año)
- **Compress Objects Automatically:** Yes

### 4. Optimizar Imágenes

```javascript
// Usar WebP para reducir tamaño hasta 30%
const result = await uploadFile(file, {
  category: 'galeria',
  optimize: true,
  optimizeOptions: {
    format: 'webp', // Más pequeño que JPEG
    quality: 80,
  },
});
```

### 5. Implementar Lazy Loading en Frontend

```tsx
// Next.js con Image component
import Image from 'next/image';

<Image
  src={noticia.imagenDestacada}
  alt={noticia.titulo}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

---

## Invalidación de Cache

### Cuándo Invalidar Cache

❌ **NO invalidar cuando:**
- Subes un nuevo archivo (tendrá nuevo key)
- Eliminas un archivo viejo

✅ **SÍ invalidar cuando:**
- Actualizas un archivo existente con el mismo key
- Eliminas un archivo que todavía puede estar en cache

### Invalidar Cache Manualmente

```javascript
const { invalidateCloudFrontCache } = require('./utils/s3CloudFront');

// Invalidar un solo archivo
await invalidateCloudFrontCache('/linkaws/eventos/2025/01/imagen.jpg');

// Invalidar múltiples archivos
await invalidateCloudFrontCache([
  '/linkaws/eventos/2025/01/imagen1.jpg',
  '/linkaws/eventos/2025/01/imagen2.jpg',
]);

// Invalidar toda una carpeta
await invalidateCloudFrontCache('/linkaws/eventos/*');
```

### Costo de Invalidaciones

- **Primeras 1,000 paths/mes:** Gratis
- **Adicionales:** $0.005 por path

💡 **Tip:** En lugar de invalidar, usa keys únicos con timestamp/random para cada archivo.

---

## Troubleshooting

### Error: "AccessDenied" al subir archivo

**Problema:** Credenciales de AWS incorrectas o sin permisos.

**Solución:**
```javascript
// Verificar en .env
AWS_PUBLIC_KEY="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

// IAM Policy necesaria:
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject"
    ],
    "Resource": "arn:aws:s3:::vm-media-storage/*"
  }]
}
```

### CloudFront devuelve 403 Forbidden

**Problema:** El objeto en S3 no es público.

**Solución:**
```javascript
// Asegurarse que makePublic está en true
await uploadFile(file, {
  makePublic: true, // ACL público
});

// O configurar Bucket Policy en S3:
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::vm-media-storage/linkaws/*"
  }]
}
```

### Imágenes no se ven después de subir

**Problema:** CloudFront puede tardar en propagar.

**Solución:**
- Esperar 5-10 minutos después de crear la distribución
- Verificar que la URL de CloudFront sea correcta
- Probar acceso directo a S3 primero

### Cache no se actualiza

**Problema:** CloudFront está cacheando versión antigua.

**Solución:**
```javascript
// Opción 1: Invalidar cache
await invalidateCloudFrontCache('/linkaws/eventos/imagen.jpg');

// Opción 2: Usar versioning en query string
const url = `${cloudFrontUrl}?v=${Date.now()}`;

// Opción 3: Usar keys únicos (recomendado)
const key = generateObjectKey(file, 'eventos');
// Resultado: linkaws/eventos/2025/01/1737584123-abc123.jpg
```

---

## Resumen de Categorías

| Categoría | Uso | Optimizar | Max Width | Quality |
|-----------|-----|-----------|-----------|---------|
| `galeria` | Álbumes de fotos | ✅ Sí | 1920px | 80% |
| `noticias` | Imágenes de noticias | ✅ Sí | 1920px | 85% |
| `eventos` | Fotos de eventos | ✅ Sí | 1600px | 80% |
| `videos` | Thumbnails custom | ✅ Sí | 1280px | 80% |
| `documentos` | PDFs, DOCX | ❌ No | - | - |
| `avatares` | Fotos de perfil | ✅ Sí | 500px | 85% |
| `thumbnails` | Miniaturas generadas | ✅ Sí | Variable | 80% |
| `general` | Otros archivos | Variable | - | - |

---

## Checklist de Implementación

- [ ] Configurar S3 Bucket con permisos públicos
- [ ] Crear distribución de CloudFront
- [ ] Agregar variables de entorno (.env)
- [ ] Instalar dependencias (@aws-sdk/*, sharp)
- [ ] Importar utils/s3CloudFront.js en controladores
- [ ] Actualizar modelos para guardar `key` además de `url`
- [ ] Ejecutar script de migración para URLs existentes
- [ ] Configurar lifecycle policies en S3
- [ ] Configurar cache policies en CloudFront
- [ ] Implementar lazy loading en frontend
- [ ] Monitorear costos en AWS Cost Explorer

---

## Recursos Adicionales

- [AWS S3 Pricing](https://aws.amazon.com/s3/pricing/)
- [AWS CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [AWS SDK v3 JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

---

**Última actualización:** Enero 2025
**Versión:** 1.0.0
