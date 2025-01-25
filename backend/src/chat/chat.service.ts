import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../user/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendMessage(userId: number, content: string): Promise<Message> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('Usuario no encontrado');

    const message = this.messageRepository.create({
      content,
      user,
    });

    return this.messageRepository.save(message);
  }

  async getLastMessages(limit: number = 50): Promise<Message[]> {
    return this.messageRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}