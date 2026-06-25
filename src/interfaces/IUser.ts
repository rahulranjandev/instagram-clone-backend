import { QueryFilter, QueryOptions, UpdateQuery } from 'mongoose';
import { IUser, User } from '@models/userModel';

export class UserService {
  public async getUsersByQuery(_id: string[]): Promise<IUser[] | null> {
    return await User.find(_id);
  }
  /**
   * @description Get User Info - Public Access
   * @Access User access
   */
  public async getUserByQuery(query: QueryFilter<IUser>): Promise<IUser | null> {
    return await User.findOne(query);
  }

  /**
   * @description Create User - Public Access
   * @Access Public access
   * @alias POST /api/v1/auth/register
   */
  public async createUser(user: IUser | any): Promise<IUser> {
    return await User.create(user);
  }

  /**
   * @description Update User - User access only
   * @Access User access - Protected
   */
  public async updateUser(id: string, user: IUser | any): Promise<IUser | null> {
    return await User.findOneAndUpdate({ _id: id }, user, { new: true, runValidators: true });
  }

  /**
   * @description Update User - User access only
   * @Access User access - Protected
   */
  public async findAndUpdateUser(query: QueryFilter<IUser>, update: UpdateQuery<IUser>, options: QueryOptions) {
    return await User.findOneAndUpdate(query, update, options);
  }

  /**
   * @description Reset Password - User access only (via email)
   * @description Send email with token to user email address and save token to user document
   */
  public async forgetPasswordToken(token: string): Promise<IUser | null> {
    return await User.findOneAndUpdate({ resetPasswordToken: token });
  }

  /**
   * @description Change Password via email and token - User access only
   * @description Find user by token and return user
   * @description Used to check if user exists
   */
  public async getUserByToken(token: string): Promise<IUser | null> {
    return await User.findOne({ resetPasswordToken: token });
  }

  /**
   * @description Change Password via email and token - User access only
   * @description Use token to find user and update password with new password and remove token
   */
  public async resetPassword(hash: string, token: string): Promise<IUser | null> {
    return await User.findOneAndUpdate({ password: hash, resetPasswordToken: token });
  }
}
