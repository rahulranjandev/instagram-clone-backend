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

io.on('connection', (socket) => {
  console.log('user Connected');

  socket.on('setup', (userData) => {
    socket.join(userData.id);
    console.log(userData.id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User Joined to Room: ' + room);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));

  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('new message', (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;

    if (!chat.users) return console.log('Chat.users not defined!');

    chat.users.forEach((user: { _id: string | string[] }) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit('message received', newMessageRecieved);
    });
  });
});

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
