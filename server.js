// server.js
import express from 'express';
import cors from 'cors';
import db from './src/models/index.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import documentRoutes from './src/routes/document.routes.js';
import { Rol } from './src/constants/index.js';
import session from 'express-session'
import 'dotenv/config';

const app = express();

const corsOptions = {
  origin: process.env.URL_FRONTEND,
  credentials: true
};

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'sesion-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // poner en true si usas HTTPS
      httpOnly: true,
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la aplicación.',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', userRoutes);
app.use('/api/documents', documentRoutes);
app.post('/api/test', (req, res) => {
  console.log('test')
  //req.session.prueba = 'guardado';
  console.log('session actualizada:', req.session);
  res.json({ ok: true });
});

app.get('/api/test1', (req, res) => {
  console.log('test')
  req.session.prueba = 'guardado';
  console.log('session actualizada:', req.session);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;

const initializeRoles = async () => {
  const roles = [Rol.ADMIN, Rol.MODERATOR, Rol.USER];
  for (const role of roles) {
    await db.role.findOrCreate({
      where: { name: role },
    });
  }
};

db.sequelize.sync().then(async () => {
  await initializeRoles();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});
