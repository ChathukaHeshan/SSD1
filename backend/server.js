import dotenv from 'dotenv';
import config from './config/index.js';
import express from 'express';
import colors from 'colors';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import session from "express-session";
import {googleAuth} from "./config/google.auth.js";
import {routesInit} from "./routes/index.js";
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

import path from 'path';

import passport from "passport";
dotenv.config();

connectDB();

const app = express();
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
// Use cookie-parser middleware to parse cookies
app.use(cookieParser());

// Use csurf middleware to generate and verify CSRF tokens
const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection to all routes that require it
app.use(csrfProtection);

// Include the CSRF token in response locals
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.get('/api/config/paypal', (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

app.use(notFound);
app.use(errorHandler);
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      expires: new Date(Date.now() + 10000),
      maxAge: 10000
    }
  })
)
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  ),
  routesInit(app, passport),
  googleAuth(passport)
);
