/**
 * Main Express Application
 * Configures middleware, routes, and error handling
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import logger from './utils/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';
import { validateCsrfToken, csrfTokenHandler } from './middleware/csrfProtection.js';
import {
  authRoutes,
  patientRoutes,
  visitRoutes,
  billRoutes,
  serviceRoutes,
  reportRoutes,
  userRoutes,
} from './routes/index.js';

const app: Application = express();

const allowedOrigins = env.NODE_ENV === 'production'
? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-origin' },
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
}));

app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiters disabled for dev
// app.use('/api/auth', authLimiter);
// app.use('/api/', apiLimiter);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'MediCore HMS API', version: '1.0.0' });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/csrf-token', csrfTokenHandler);

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;