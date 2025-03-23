// server.js
import express from 'express';
import cors from 'cors';
import db from './src/models/index.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import documentRoutes from './src/routes/document.routes.js';
import { Rol } from './src/constants/index.js';
import session from 'express-session';
import 'dotenv/config';

const app = express();

app.use(cors({
  origin: process.env.URL_FRONTEND,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'sesion-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // poner en true si usas HTTPS
      httpOnly: true,
      sameSite: 'lax',      // O 'strict', o 'none' (si usás cross-domain + HTTPS)
      maxAge: 1000 * 60 * 5 // 5 minutos
    },
  })
);

app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la aplicación.',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', userRoutes);
app.use('/api/documents', documentRoutes);
app.get('/set', (req, res) => {
  req.session.test = 'Hol111a';
  res.send('Sesión guardada');
});

app.get('/get', (req, res) => {
  res.send(req.session.test || 'No hay sesión');
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
