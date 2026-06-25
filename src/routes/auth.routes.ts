import { Router } from 'express';

const router = Router();

import { AuthController } from '@controllers/authController';
import { PasswdController } from '@/controllers/passwdController';

import AuthMiddleware from '@middlewares/authMiddleware';
import validateSchema from '@/middlewares/validateSchema';

import { loginUserSchema, registerUserSchema, forgetPasswordSchema, resetPasswordSchema } from '@schema/userSchema';

const Auth = new AuthController();
const authMiddleware = new AuthMiddleware();
const Password = new PasswdController();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a user
 *     operationId: registerUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, username, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: Ada Lovelace
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: ada
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ada@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 maxLength: 50
 *                 example: secure-password
 *               avatar:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: User registered and authenticated
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: string
 *                   description: Created user ID
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   POST /api/auth/register
 * @desc    Register user
 * @access  Public
 * @body    name, email and password
 */
router.post('/register', validateSchema(registerUserSchema), Auth.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Log in
 *     operationId: loginUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ada@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 maxLength: 50
 *                 example: secure-password
 *     responses:
 *       200:
 *         description: Authentication succeeded
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     username:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    email and password
 */
router.post('/login', validateSchema(loginUserSchema), Auth.login);

/**
 * @openapi
 * /api/auth/forgotpassword:
 *   post:
 *     tags: [Authentication]
 *     summary: Request a password reset email
 *     operationId: forgotPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ada@example.com
 *     responses:
 *       200:
 *         description: Password reset email accepted for delivery
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email sent
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   POST /api/auth/forgotpassword
 * @desc    Forgot password
 * @access  Public
 * @body    email
 */
router.post('/forgotpassword', validateSchema(forgetPasswordSchema), Password.forgotPassword);

/**
 * @openapi
 * /api/auth/resetpassword:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset a password using a reset token
 *     operationId: resetPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 maxLength: 50
 *     responses:
 *       200:
 *         description: Password reset succeeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   PUT /api/auth/resetpassword
 * @desc    Reset password
 * @access  Public
 * @body    password (new password) and resettoken
 */
router.post('/resetpassword', validateSchema(resetPasswordSchema), Password.resetPassword);

/**
 * @openapi
 * /api/auth/changepassword:
 *   get:
 *     tags: [Authentication]
 *     summary: Change the authenticated user's password
 *     description: This endpoint currently accepts a JSON body with a GET request.
 *     operationId: changePassword
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   GET /api/auth/changepassword
 * @desc    Change password
 * @access  Private
 * @body    password (old password) and newpassword
 */
router.get('/changepassword', authMiddleware.isAuthenticated, authMiddleware.requireUser, Password.changePassword);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Log out
 *     operationId: logoutUser
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Authentication cookies cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User logged out successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @route   GET /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authMiddleware.isAuthenticated, authMiddleware.requireUser, Auth.logout);

export default router;
