import mongoose, { Types } from 'mongoose';

interface IChat {
  _id?: Types.ObjectId;
  user?: Types.ObjectId;
  chatName: string;
  isGroupChat: boolean;
  latestMessage?: Types.ObjectId;
  groupAdmin?: Types.ObjectId;
  members: Types.ObjectId[];
  directChatKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const chatSchema = new mongoose.Schema<IChat>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    chatName: {
      type: String,
      trim: true,
      required: [true, 'Chat name is required'],
      maxlength: [100, 'Chat name cannot exceed 100 characters'],
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    directChatKey: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

chatSchema.index({ members: 1, updatedAt: -1 });

const Chat = mongoose.model<IChat>('Chat', chatSchema);

export { Chat, IChat };
