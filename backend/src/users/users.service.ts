import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, type UserDocument } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  create(user: Pick<User, 'email' | 'passwordHash' | 'nombre' | 'role'>) {
    return this.userModel.create(user);
  }

  countAll() {
    return this.userModel.countDocuments().exec();
  }
}
