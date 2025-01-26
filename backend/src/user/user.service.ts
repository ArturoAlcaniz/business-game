import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async updateStudyLevel(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('Usuario no encontrado');

    // Incrementar días consecutivos de inicio de sesión
    user.consecutiveLoginDays += 1;

    // Lógica para subir de nivel de estudios
    if (user.consecutiveLoginDays >= 3 && user.studyLevel === 1 && user.balance >= 1000) {
      user.studyLevel = 2;
      user.balance -= 1000;
    } else if (user.consecutiveLoginDays >= 6 && user.studyLevel === 2 && user.balance >= 5000) {
      user.studyLevel = 3;
      user.balance -= 5000;
    } else if (user.consecutiveLoginDays >= 10 && user.studyLevel === 3 && user.balance >= 10000) {
      user.studyLevel = 4;
      user.balance -= 10000;
    } else if (user.consecutiveLoginDays >= 20 && user.studyLevel === 4 && user.balance >= 20000) {
      user.studyLevel = 5;
      user.balance -= 20000;
    }

    return this.userRepository.save(user);
  }

  async addDailyMoney(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('Usuario no encontrado');
  
    // Verifica si el usuario ya recibió dinero hoy
    if (user.lastDailyMoneyDate != undefined && String(user.lastDailyMoneyDate) === new Date().toISOString().split('T')[0]) {
      throw new Error('Ya has recibido dinero hoy');
    }

    return await this.updateUser(user.id, {
      balance: user.balance += 100 * user.studyLevel,
      lastDailyMoneyDate: new Date(),
    });
  }

  async updateUser(userId: number, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(userId, updateData);
    return this.userRepository.findOne({ where: { id: userId } });
  }
}