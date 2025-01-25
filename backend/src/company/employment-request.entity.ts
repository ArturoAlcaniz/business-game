import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../user/user.entity';
import { Company } from './company.entity';

@Entity()
export class EmploymentRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.employmentRequests)
  user: User;

  @ManyToOne(() => Company, (company) => company.employmentRequests)
  company: Company;

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected'; // Estado de la solicitud
}