const { auth } = require('express-openid-connect');

// Ensure BASE_URL has https:// protocol
let baseURL = process.env.BASE_URL;
if (baseURL && !baseURL.startsWith('http')) {
  baseURL = `https://${baseURL}`;
}

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: baseURL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  routes: {
    login: false
  },
  session: {
    cookie: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production'
    }
  }
};

module.exports = auth(config);
