import { Router } from 'express';
import { NextFunction, Request, Response } from 'express';

const router = Router();

import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import chatRoutes from './chat.routes';

const status = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    status: 'success',
    message: 'Server is running',
  });
};

/**
 * @openapi
 * /:
 *   get:
 *     tags: [System]
 *     summary: Check API status
 *     operationId: getApiStatus
 *     responses:
 *       200:
 *         description: The API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
router.route('/').get(status);

/**
 * @description Auth Routes - /api/auth - Public Routes
 * @APIVersion 1
 * @middleware apiVersionMiddleware
 */
router.use('/api/auth', authRoutes);

/**
 * @description User Routes - /api/user - Public Routes
 * @APIVersion 1
 * @middleware apiVersionMiddleware
 * @middleware auth
 * @middleware upload
 */
router.use('/api/user', userRoutes);

/**
 * @description Post Routes - /api/post - Private Routes
 * @APIVersion 1
 * @middleware apiVersionMiddleware
 * @middleware auth
 * @middleware upload
 */
router.use('/api/post', postRoutes);

/**
 * @description Chat Routes - /api/chat - Private Routes
 * @middleware auth
 */
router.use('/api/chat', chatRoutes);

export default router;
