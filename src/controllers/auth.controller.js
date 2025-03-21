import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { Rol } from '../constants/index.js';
import { clientConfig, getClientConfig } from '../config/openid.js';
import 'dotenv/config';
import * as client from 'openid-client';

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

// Ciudadanía Digital Autenticación
export const loginCD = async (req, res) => {
  const config = await getClientConfig();

  const code_verifier = client.randomPKCECodeVerifier();
  const code_challenge = await client.calculatePKCECodeChallenge(code_verifier);
  const state = client.randomState();

  // Guardar en sesión
  req.session.code_verifier = code_verifier;
  console.log('code_verifie', code_verifier)
  req.session.state = state;
  console.log('state', state)
  console.log('se guard???', req.session)

  const parameters = {
    redirect_uri: clientConfig.redirectUris,
    scope: clientConfig.scope,
    code_challenge,
    code_challenge_method: 'S256',
  };

  const redirectTo = client.buildAuthorizationUrl(config, parameters);

  res.redirect(redirectTo);
};

export const callback = async (req, res) => {
  console.log('==========> callback');
  console.log('==========> callback1111');
  const config = await getClientConfig();
  console.log('==========> callback1112');
  const params = req.query;
  console.log('==========> callback1113', params);
  console.log('==========> callback1113', req.session);

 /*  if (req.session.state !== params.state) {
    return res.status(400).send('Invalid state');
  } */

  console.log('iss', params.iss);
  console.log('1111', req.session);
  console.log('1111', req.session.code_verifier);
  console.log('1111', req.session.state);


  let getCurrentUrl = (req) => {
    return new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
  };
  console.log('no entiend', getCurrentUrl(req))
  console.log('no entiend', getCurrentUrl(req).href)
  const tokenSet = await client.authorizationCodeGrant(
    config,
    new URL(getCurrentUrl(req)),
    {
      pkceCodeVerifier: req.session.code_verifier,
      expectedState: req.session.state,
    }
  );

  console.log('tokenset--------------->', tokenSet);

  const userInfo = await client.userinfo(tokenSet.access_token);
  console.log('UserInfo', userInfo);

  // Limpiar sesión
  delete req.session.code_verifier;
  delete req.session.state;

  // Aquí podrías guardar info en sesión si deseas
  req.session.user = userInfo;

  res.redirect('http://localhost:5173/home');
};
