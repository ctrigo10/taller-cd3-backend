import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { Rol } from '../constants/index.js';
import crypto from 'crypto';
import axios from 'axios';

const User = db.user;
const Role = db.role;

export const signup = async (req, res) => {
  try {
    // Create new user
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const role = await Role.findOne({ where: { name: Rol.USER } });
    await user.setRoles([role]);

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const signin = async (req, res) => {
  try {
    // Find user by username
    const user = await User.findOne({
      where: {
        username: req.body.username,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User Not found.' });
    }

    // Validate password
    const passwordIsValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        accessToken: null,
        message: 'Invalid Password!',
      });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id }, process.env.JW_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    // Get user roles
    const roles = await user.getRoles();
    const authorities = roles.map((role) => `ROLE_${role.name.toUpperCase()}`);

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const issuer = process.env.OIDC_ISSUER;
const clientId = process.env.OIDC_CLIENT_ID;
const secret = process.env.OIDC_CLIENT_SECRET;
const redirect = process.env.OIDC_REDIRECT_URI;
const scope = process.env.OIDC_SCOPE;

export const loginCiudadania = (req, res) => {
  const state = crypto.randomBytes(30).toString('hex');
  const nonce = crypto.randomBytes(30).toString('hex');
  req.session.state = state;
  req.session.nonce = nonce;

  const authorizationUrl = `${issuer}/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirect}&scope=${scope}&state=${state}&nonce=${nonce}`;
  res.redirect(authorizationUrl);
};

export const callback = async (req, res) => {
  console.log(' ========== query', req.query);
  const { code } = req.query;

  try {
    const base64 = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const authHeader = `Basic ${base64}`;

    // Crear el body usando URLSearchParams
    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', code);
    body.append('redirect_uri', redirect);

    const tokenResponse = await axios.post(`${issuer}/token`, body.toString(), {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
    });

    console.log('====== resultado tokenResponse', tokenResponse.data);
    const { access_token } = tokenResponse.data;

    const userInfo = await axios.get(`${issuer}/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    console.log('====== resultado userinfo', userInfo.data);
    req.session.user = userInfo.data;

    // *******************Termina OAUTH2

    // Buscar o crear usuario en la base de datos
    const username = userInfo.data.profile.documento_identidad.numero_documento;
    let user = await User.findOne({ where: { username } });

    if (!user) {
      const hashedPassword = await bcrypt.hash(userInfo.data.email, 10);
      user = await User.create({
        username,
        email: userInfo.data.email,
        password: hashedPassword,
      });

      const role = await Role.findOne({ where: { name: Rol.USER } });
      await user.setRoles([role]);
    }

    // Generar JWT
    const token = jwt.sign({ id: user.id }, process.env.JW_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    // Get user roles
    const roles = await user.getRoles();
    const authorities = roles.map((role) => `ROLE_${role.name.toUpperCase()}`);
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res
      .status(500)
      .json({
        error: 'Error al autenticar',
        details: err.response?.data || err.message,
      });
  }
};
