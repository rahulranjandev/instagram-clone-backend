import express, { NextFunction, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from '@utils/connectDB';
import { PORT, NODE_ENV } from '@config';
import swaggerSpec from '@/config/swagger';
import { initializeChatSocket } from '@/socket/chatSocket';

import router from '@routes/index';

console.log(`NODE_ENV: ${NODE_ENV}`);

const app = express();
const httpServer = createServer(app);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Logger
if (NODE_ENV === 'development') app.use(morgan('dev'));

// Cors
app.use(cors());

// API documentation
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.json(swaggerSpec);
});
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// Main Routes
app.use('/', router);

// Socket.io
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: '*',
  },
});

initializeChatSocket(io);

// UnKnown Routes
app.all('/{*path}', (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

httpServer.listen(PORT ?? 3333, () => {
  console.log(`Server is running on port ${PORT}`);

  connectDB();
});
