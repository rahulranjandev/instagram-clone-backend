import { Router } from 'express';

const router = Router();

import AuthMiddleware from '@middlewares/authMiddleware';

import upload from '@/utils/upload';

import { PostController } from '@/controllers/postController';

const Post = new PostController();

const authMiddleware = new AuthMiddleware();

/**
 * @openapi
 * /api/post/create:
 *   post:
 *     tags: [Posts]
 *     summary: Create a post
 *     operationId: createPost
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [caption, images]
 *             properties:
 *               caption:
 *                 type: string
 *                 example: A day at the beach
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   POST /api/post/create
 * @desc    Create a post
 * @access  Private
 */
router.post('/create', authMiddleware.isAuthenticated, authMiddleware.requireUser, upload.any(), Post.createPost);

/**
 * @openapi
 * /api/post:
 *   get:
 *     tags: [Posts]
 *     summary: Get posts created by the authenticated user
 *     operationId: getPosts
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Posts and temporary image download URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                     imageUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uri
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   GET /api/post
 * @desc    Get all posts
 * @access  Private
 */
router.get('/', authMiddleware.isAuthenticated, authMiddleware.requireUser, upload.any(), Post.getPosts);

/**
 * @openapi
 * /api/post/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get a post by ID
 *     operationId: getPost
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB post ID
 *     responses:
 *       200:
 *         description: Post and temporary image download URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     post:
 *                       $ref: '#/components/schemas/Post'
 *                     imageUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uri
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   GET /api/post/:id
 * @desc    Get a post
 * @access  Private
 */

router.get('/:id', authMiddleware.isAuthenticated, authMiddleware.requireUser, upload.any(), Post.getPost);

/**
 * @openapi
 * /api/post/{id}/delete:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete a post and its stored images
 *     operationId: deletePost
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB post ID
 *     responses:
 *       200:
 *         description: Post deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   DELETE /api/post/:id/delete
 * @desc    Delete a post
 * @access  Private
 * @params  id
 */
router.delete('/:id/delete', authMiddleware.isAuthenticated, authMiddleware.requireUser, upload.any(), Post.deletePost);

export default router;
