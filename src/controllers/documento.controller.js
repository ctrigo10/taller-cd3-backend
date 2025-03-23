import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 } from 'uuid';
import { getFileBase64, sha256 } from '../utils/file.js';
import { TipoDocumentoCD } from '../constants/index.js';
import axios from 'axios';
import 'dotenv/config';

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

export const uploadFile = async (req, res) => {
  console.log('Uploading file', req.file);
  console.log('sesion', req.session)
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const documentoBase64 = await getFileBase64(req.file.path);
    const hashDocumento = sha256(documentoBase64);
    const codigoTramite = v4();
    const tipoDocumento =
      req.file.mimetype === 'application/json'
        ? TipoDocumentoCD.JSON
        : TipoDocumentoCD.PDF;

    const dataAprobacion = {
      tipoDocumento,
      documento: documentoBase64,
      hashDocumento,
      idTramite: codigoTramite,
      descripcion: `Aprobación documento ${codigoTramite}`,
      accessToken: req.session.token,
    };

    console.log('dataAprobacion', dataAprobacion.accessToken)

    const urlAprobador = process.env.APROBADOR_URL;
    const tokenAprobador = process.env.APROBADOR_TOKEN;
    const response = await axios.post(
      `${urlAprobador}/api/solicitudes`,
      dataAprobacion,
      {
        headers: {
          Authorization: `Bearer ${tokenAprobador}`, // Agrega el token JWT en el header Authorization
        },
      }
    );
    res
      .status(200)
      .json({ mensaje: 'Se recupero el base64', datos: response });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: 'Error al autenticar',
      details: err.response?.data || err.message,
    });
  }
};

export const uploadMiddleware = upload.single('file');
