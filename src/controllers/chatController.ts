import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Chat } from '@models/chatModel';
import { Message } from '@models/messageModel';
import { User } from '@models/userModel';

const chatPopulation = [
  { path: 'members', select: 'name username email avatar verified' },
  { path: 'groupAdmin', select: 'name username avatar' },
  {
    path: 'latestMessage',
    populate: { path: 'sender', select: 'name username avatar' },
  },
];

const isObjectId = (value: string) => mongoose.isValidObjectId(value);

export class ChatController {
  public accessDirectChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = res.locals.user.id as string;
      const recipientId = req.body.userId as string;

      if (!recipientId || !isObjectId(recipientId)) {
        return res.status(400).json({ message: 'A valid userId is required' });
      }

      if (recipientId === currentUserId) {
        return res.status(400).json({ message: 'You cannot create a chat with yourself' });
      }

      const recipient = await User.findById(recipientId).select('_id name username');
      if (!recipient) {
        return res.status(404).json({ message: 'User does not exist' });
      }

      const directChatKey = [currentUserId, recipientId].sort().join(':');
      let chat = await Chat.findOne({ directChatKey }).populate(chatPopulation);

      if (!chat) {
        try {
          chat = await Chat.create({
            user: currentUserId,
            chatName: recipient.username,
            isGroupChat: false,
            members: [currentUserId, recipientId],
            directChatKey,
          });
        } catch (error: any) {
          if (error?.code === 11000) {
            chat = await Chat.findOne({ directChatKey });
          } else {
            throw error;
          }
        }

        if (!chat) {
          throw new Error('Unable to create or load the direct chat');
        }
        chat = await chat.populate(chatPopulation);
      }

      return res.status(200).json({ data: chat });
    } catch (error) {
      next(error);
    }
  };

  public getChats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const chats = await Chat.find({ members: res.locals.user.id }).populate(chatPopulation).sort({ updatedAt: -1 });

      return res.status(200).json({ data: chats });
    } catch (error) {
      next(error);
    }
  };

  public createGroupChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = res.locals.user.id as string;
      const chatName = String(req.body.chatName ?? '').trim();
      const requestedMembers = Array.isArray(req.body.members) ? req.body.members.map(String) : [];
      const memberIds = [...new Set([currentUserId, ...requestedMembers])];

      if (!chatName) {
        return res.status(400).json({ message: 'chatName is required' });
      }

      if (memberIds.length < 3 || memberIds.some((id) => !isObjectId(id))) {
        return res.status(400).json({ message: 'A group chat requires at least three valid members' });
      }

      const existingUsers = await User.countDocuments({ _id: { $in: memberIds } });
      if (existingUsers !== memberIds.length) {
        return res.status(400).json({ message: 'One or more members do not exist' });
      }

      let chat = await Chat.create({
        user: currentUserId,
        chatName,
        isGroupChat: true,
        groupAdmin: currentUserId,
        members: memberIds,
      });
      chat = await chat.populate(chatPopulation);

      return res.status(201).json({ data: chat });
    } catch (error) {
      next(error);
    }
  };

  public renameGroupChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chatId = String(req.params.chatId);
      const chatName = String(req.body.chatName ?? '').trim();
      if (!isObjectId(chatId)) {
        return res.status(400).json({ message: 'A valid chatId is required' });
      }
      if (!chatName) {
        return res.status(400).json({ message: 'chatName is required' });
      }

      const chat = await Chat.findOneAndUpdate(
        {
          _id: chatId,
          isGroupChat: true,
          groupAdmin: res.locals.user.id,
        },
        { chatName },
        { new: true, runValidators: true },
      ).populate(chatPopulation);

      if (!chat) {
        return res.status(404).json({ message: 'Group chat not found or you are not its admin' });
      }

      return res.status(200).json({ data: chat });
    } catch (error) {
      next(error);
    }
  };

  public addGroupMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chatId = String(req.params.chatId);
      const userId = String(req.params.userId);
      if (!isObjectId(chatId) || !isObjectId(userId)) {
        return res.status(400).json({ message: 'Valid chatId and userId values are required' });
      }
      if (!(await User.exists({ _id: userId }))) {
        return res.status(404).json({ message: 'User does not exist' });
      }

      const chat = await Chat.findOneAndUpdate(
        {
          _id: chatId,
          isGroupChat: true,
          groupAdmin: res.locals.user.id,
        },
        { $addToSet: { members: userId } },
        { new: true, runValidators: true },
      ).populate(chatPopulation);

      if (!chat) {
        return res.status(404).json({ message: 'Group chat not found or you are not its admin' });
      }

      return res.status(200).json({ data: chat });
    } catch (error) {
      next(error);
    }
  };

  public removeGroupMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chatId = String(req.params.chatId);
      const userId = String(req.params.userId);
      if (!isObjectId(chatId) || !isObjectId(userId)) {
        return res.status(400).json({ message: 'Valid chatId and userId values are required' });
      }
      const currentUserId = res.locals.user.id as string;
      const chat = await Chat.findOne({ _id: chatId, isGroupChat: true });

      if (!chat) {
        return res.status(404).json({ message: 'Group chat not found' });
      }

      const isAdmin = chat.groupAdmin?.toString() === currentUserId;
      const isLeaving = userId === currentUserId;
      if (!isAdmin && !isLeaving) {
        return res.status(403).json({ message: 'Only the group admin can remove another member' });
      }

      if (chat.groupAdmin?.toString() === userId) {
        return res.status(400).json({ message: 'The group admin cannot leave before assigning another admin' });
      }

      chat.members = chat.members.filter((member) => member.toString() !== userId);
      await chat.save();
      await chat.populate(chatPopulation);

      return res.status(200).json({ data: chat });
    } catch (error) {
      next(error);
    }
  };

  public getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chatId = String(req.params.chatId);
      if (!isObjectId(chatId)) {
        return res.status(400).json({ message: 'A valid chatId is required' });
      }
      const membership = await Chat.exists({ _id: chatId, members: res.locals.user.id });
      if (!membership) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      const parsedLimit = Number(req.query.limit);
      const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;
      const query: Record<string, any> = { chat: chatId };

      if (req.query.before) {
        const before = new Date(String(req.query.before));
        if (Number.isNaN(before.getTime())) {
          return res.status(400).json({ message: 'before must be a valid date' });
        }
        query.createdAt = { $lt: before };
      }

      const messages = await Message.find(query)
        .populate('sender', 'name username avatar')
        .sort({ createdAt: -1 })
        .limit(limit);

      return res.status(200).json({ data: messages.reverse() });
    } catch (error) {
      next(error);
    }
  };
}
