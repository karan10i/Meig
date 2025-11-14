const { auth, requiresAuth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET || 'a-long-randomly-generated-string-stored-in-env',
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  clientID: process.env.AUTH0_CLIENT_ID || 'hSJPCAaEo5vZ3kARTOR5U3rNBu4AJJMO',
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || 'https://meig.eu.auth0.com',
  routes: {
    logout: '/logout'
  },
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email'
  }
};

// Export the auth middleware and requiresAuth
module.exports = { auth: auth(config), requiresAuth };
