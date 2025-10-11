const express = require('express');
const path = require('path')
const app = express();
const expressSession = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
require("dotenv").config()

const port = process.env.PORT || "8000";

