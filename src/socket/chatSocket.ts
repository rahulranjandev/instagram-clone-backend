import { Server, Socket } from 'socket.io';
import { Chat } from '@models/chatModel';
import { Message } from '@models/messageModel';
import { User } from '@models/userModel';
import { verifyToken } from '@utils/jwt';

type EventCallback = (response: { data?: any; message?: string }) => void;

interface AuthTokenPayload {
  user: {
    id: string;
  };
}

interface SendMessagePayload {
  chatId: string;
  text: string;
}

const getHandshakeToken = (socket: Socket) => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === 'string' && authToken) return authToken.replace(/^Bearer\s+/i, '');

  const authorization = socket.handshake.headers.authorization;
  if (authorization?.startsWith('Bearer ')) return authorization.slice(7);

  const cookie = socket.handshake.headers.cookie;
  const accessTokenCookie = cookie
    ?.split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('access_token='));

  return accessTokenCookie ? decodeURIComponent(accessTokenCookie.split('=').slice(1).join('=')) : null;
};

const isChatMember = async (chatId: string, userId: string) => {
  return Boolean(await Chat.exists({ _id: chatId, members: userId }));
};

const emitSocketError = (socket: Socket, message: string, callback?: EventCallback) => {
  const response = { message };
  callback?.(response);
  socket.emit('chat:error', response);
};

export const initializeChatSocket = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = getHandshakeToken(socket);
      if (!token) return next(new Error('Authentication token is required'));

      const decoded = verifyToken<AuthTokenPayload>(token);
      const userId = decoded?.user?.id;
      if (!userId || !(await User.exists({ _id: userId }))) {
        return next(new Error('Invalid or expired authentication token'));
      }

      socket.data.userId = userId;
      next();
    } catch (_error) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    socket.emit('connected', { userId });

    const joinChat = async (chatId: string, callback?: EventCallback) => {
      try {
        if (!chatId || !(await isChatMember(chatId, userId))) {
          return emitSocketError(socket, 'Chat not found or access denied', callback);
        }

        await socket.join(`chat:${chatId}`);
        callback?.({ data: { chatId } });
      } catch (_error) {
        emitSocketError(socket, 'Unable to join chat', callback);
      }
    };

    const leaveChat = async (chatId: string, callback?: EventCallback) => {
      await socket.leave(`chat:${chatId}`);
      callback?.({ data: { chatId } });
    };

    const sendMessage = async (payload: SendMessagePayload, callback?: EventCallback) => {
      try {
        const chatId = payload?.chatId;
        const text = String(payload?.text ?? '').trim();

        if (!chatId || !text) {
          return emitSocketError(socket, 'chatId and text are required', callback);
        }

        const chat = await Chat.findOne({ _id: chatId, members: userId });
        if (!chat) {
          return emitSocketError(socket, 'Chat not found or access denied', callback);
        }

        let message = await Message.create({
          chat: chatId,
          sender: userId,
          text,
          readBy: [userId],
        });

        await Chat.updateOne({ _id: chatId }, { latestMessage: message._id });
        message = await message.populate('sender', 'name username avatar');

        const messageData = message.toObject();
        for (const memberId of chat.members) {
          io.to(`user:${memberId.toString()}`).emit('message:received', messageData);
          io.to(`user:${memberId.toString()}`).emit('message received', messageData);
        }

        callback?.({ data: messageData });
      } catch (error: any) {
        const message = error?.errors?.text?.message ?? 'Unable to send message';
        emitSocketError(socket, message, callback);
      }
    };

    const typing = async (chatId: string, isTyping: boolean, callback?: EventCallback) => {
      try {
        if (!chatId || !(await isChatMember(chatId, userId))) {
          return emitSocketError(socket, 'Chat not found or access denied', callback);
        }

        socket.to(`chat:${chatId}`).emit(isTyping ? 'typing' : 'stop typing', { chatId, userId });
        socket.to(`chat:${chatId}`).emit('typing:changed', { chatId, userId, isTyping });
        callback?.({ data: { chatId, isTyping } });
      } catch (_error) {
        emitSocketError(socket, 'Unable to update typing status', callback);
      }
    };

    const markRead = async (chatId: string, callback?: EventCallback) => {
      try {
        if (!chatId || !(await isChatMember(chatId, userId))) {
          return emitSocketError(socket, 'Chat not found or access denied', callback);
        }

        await Message.updateMany(
          { chat: chatId, sender: { $ne: userId }, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } },
        );

        const data = { chatId, userId, readAt: new Date() };
        io.to(`chat:${chatId}`).emit('messages:read', data);
        callback?.({ data });
      } catch (_error) {
        emitSocketError(socket, 'Unable to mark messages as read', callback);
      }
    };

    socket.on('chat:join', joinChat);
    socket.on('join chat', joinChat);
    socket.on('chat:leave', leaveChat);
    socket.on('leave chat', leaveChat);
    socket.on('message:send', sendMessage);
    socket.on('new message', sendMessage);
    socket.on('typing:start', (chatId, callback) => typing(chatId, true, callback));
    socket.on('typing', (chatId, callback) => typing(chatId, true, callback));
    socket.on('typing:stop', (chatId, callback) => typing(chatId, false, callback));
    socket.on('stop typing', (chatId, callback) => typing(chatId, false, callback));
    socket.on('messages:mark-read', markRead);
  });
};
