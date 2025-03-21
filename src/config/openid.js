import dotenv from 'dotenv';
import * as client from 'openid-client';

dotenv.config();

let config;

export const clientConfig = {
  issuer: process.env.OIDC_ISSUER,
  clientId: process.env.OIDC_CLIENT_ID,
  clientSecret: process.env.OIDC_CLIENT_SECRET,
  redirectUris: [process.env.OIDC_REDIRECT_URI],
  endSessionEndpoint: process.env.OIDC_POST_LOGOUT_REDIRECT_URI,
  scope: process.env.OIDC_REDIRECT_SCOPE,
};

export const getClientConfig = async () => {
  if (config) return config;
  config = await client.discovery(
    new URL(clientConfig.issuer),
    clientConfig.clientId,
    clientConfig.clientSecret
  );
  return config;
};
