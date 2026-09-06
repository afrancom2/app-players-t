import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email: email.toLowerCase().trim() } });
  }

  findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  create(user: Pick<User, 'email' | 'passwordHash' | 'nombre' | 'role'>) {
    return this.userRepo.save(this.userRepo.create(user));
  }

  countAll() {
    return this.userRepo.count();
  }
}
