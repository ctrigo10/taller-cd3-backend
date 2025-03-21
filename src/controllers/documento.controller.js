import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Verificar si el directorio 'uploads' existe, si no, crearlo
const uploadDir = './uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Crea el directorio si no existe
}

// Configuración de multer para almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Usamos el directorio de carga
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para el archivo
  },
});

// Filtro para aceptar solo PDF y JSON
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/json'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF o JSON'), false);
  }
};

// Middleware de multer
const upload = multer({ storage, fileFilter });

export const uploadFile = (req, res, next) => {
  console.log('Uploading file', req.file);
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  res.status(200).send({
    message: 'Archivo subido exitosamente.',
    file: req.file, // Información del archivo subido
  });
};

export const uploadMiddleware = upload.single('file');
