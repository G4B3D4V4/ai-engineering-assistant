import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CreateUserRequest } from './dto/requests/create-user-request.dto.js';
import { CreateUserResponse } from './dto/responses/create-user-response.dto.js';
import { FindUserByEmailResponse } from './dto/responses/find-user-by-email-response.dto.js';
import { UserResponse } from './dto/responses/user-response.dto.js';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async create(dto: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      return await this.db.user.create({
        select: { id: true, email: true, firstName: true, lastName: true },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }

      throw error;
    }
  }

  async findById(id: number): Promise<UserResponse> {
    const foundUser = await this.db.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!foundUser) throw new NotFoundException('User not found');

    return foundUser;
  }

  async findByEmail(email: string): Promise<FindUserByEmailResponse | null> {
    return this.db.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, firstName: true, lastName: true },
    });
  }
}
