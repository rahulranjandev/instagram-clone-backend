import { Router } from 'express';
import { ChatController } from '@controllers/chatController';
import AuthMiddleware from '@middlewares/authMiddleware';

const router = Router();
const chatController = new ChatController();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.isAuthenticated, authMiddleware.requireUser);

router.get('/', chatController.getChats);
router.post('/', chatController.accessDirectChat);
router.post('/group', chatController.createGroupChat);
router.patch('/:chatId/group', chatController.renameGroupChat);
router.put('/:chatId/members/:userId', chatController.addGroupMember);
router.delete('/:chatId/members/:userId', chatController.removeGroupMember);
router.get('/:chatId/messages', chatController.getMessages);

export default router;
