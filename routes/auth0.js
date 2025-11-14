const { auth, requiresAuth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  routes: {
    logout: '/logout',
    postLogoutRedirect: '/'
  },
  session: {
    name: 'appSession',
    rolling: true,
    rollingDuration: 86400, // 24 hours in seconds
    absoluteDuration: 604800, // 7 days in seconds
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'Lax',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
    }
  }
};

module.exports = { auth: auth(config), requiresAuth };
