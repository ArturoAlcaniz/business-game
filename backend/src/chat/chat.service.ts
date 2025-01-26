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

  async sendMessage(username: string, content: string): Promise<Message> {
    const user = await this.userRepository.findOne({ where: { username: username } });
    if (!user) throw new Error('Usuario no encontrado');

    const message = this.messageRepository.create({
      content,
      user,
    });

    return this.messageRepository.save(message);
  }

  async getLastMessages(limit: number = 50, offset: number = 0): Promise<Message[]> {
    const maxLimit = 50; // Límite máximo de mensajes por solicitud
    const safeLimit = Math.min(limit, maxLimit);

    return this.messageRepository.find({
      relations: ['user'], // Incluye la relación con el usuario
      order: { createdAt: 'DESC' }, // Ordena por fecha de creación (más recientes primero)
      skip: offset, // Salta los primeros 'offset' mensajes
      take: safeLimit, // Limita el número de mensajes devueltos
    });
  }
}