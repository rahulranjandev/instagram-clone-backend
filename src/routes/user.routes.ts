import { Router } from 'express';

const router = Router();

import AuthMiddleware from '@middlewares/authMiddleware';

import { UserController } from '@/controllers/userController';

const authMiddleware = new AuthMiddleware();
const User = new UserController();

/**
 * @openapi
 * /api/user/{username}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user profile
 *     operationId: getUserByUsername
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: ada
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/PublicUser'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   GET /api/user/:username
 * @desc    Get user by username
 * @access  Private
 * @params  username
 */
router.get('/:username', authMiddleware.isAuthenticated, authMiddleware.requireUser, User.getUserByUsername);

/**
 * @openapi
 * /api/user/{username}/followers:
 *   get:
 *     tags: [Users]
 *     summary: Get a user's followers
 *     operationId: getUserFollowers
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User followers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Followers
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   GET /api/user/:username/followers
 * @desc    Get user followers
 * @access  Private
 * @params  username
 */
router.get('/:username/followers', authMiddleware.isAuthenticated, authMiddleware.requireUser, User.getUserFollowers);

/**
 * @openapi
 * /api/user/{username}/following:
 *   get:
 *     tags: [Users]
 *     summary: Get users followed by a user
 *     operationId: getUserFollowing
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Followed users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Following
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   GET /api/user/:username/following
 * @desc    Get user following
 * @access  Private
 * @params  username
 */
router.get('/:username/following', authMiddleware.isAuthenticated, authMiddleware.requireUser, User.getUserFollowing);

/**
 * @openapi
 * /api/user/{username}/follow:
 *   get:
 *     tags: [Users]
 *     summary: Follow a user
 *     operationId: followUser
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User followed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User followed
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   GET /api/user/:username/follow
 * @desc    Follow user
 * @access  Private
 * @params  username
 */
router.get('/:username/follow', authMiddleware.isAuthenticated, authMiddleware.requireUser, User.followUser);

/**
 * @openapi
 * /api/user/{username}/unfollow:
 *   get:
 *     tags: [Users]
 *     summary: Unfollow a user
 *     operationId: unfollowUser
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unfollowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User unfollowed
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   GET /api/user/:username/unfollow
 * @desc    Unfollow user
 * @access  Private
 * @params  username
 */
router.get('/:username/unfollow', authMiddleware.isAuthenticated, authMiddleware.requireUser, User.unfollowUser);

export default router;
