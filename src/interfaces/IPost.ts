import { QueryFilter, QueryOptions, UpdateQuery } from 'mongoose';
import { IPost, Post } from '@models/postModel';

export class PostService {
  public async createPost(post: IPost | any): Promise<IPost> {
    return await Post.create(post);
  }

  public async getPostByQuery(query: QueryFilter<IPost>): Promise<IPost | null> {
    return await Post.findOne(query);
  }

  public async getPostsByQuery(query: QueryFilter<IPost>): Promise<IPost[] | null> {
    return await Post.find(query);
  }

  public async updatePost(id: any, post: IPost | any): Promise<IPost | null> {
    return await Post.findOneAndUpdate({ _id: id }, post, { new: true, runValidators: true });
  }

  public async findAndUpdatePost(query: QueryFilter<IPost>, update: UpdateQuery<IPost>, options: QueryOptions) {
    return await Post.findOneAndUpdate(query, update, options);
  }

  public async deletePost(id: string): Promise<IPost | null> {
    return await Post.findOneAndDelete({ _id: id });
  }
}
