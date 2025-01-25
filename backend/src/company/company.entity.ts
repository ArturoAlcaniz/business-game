import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { EmploymentRequest } from './employment-request.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 1000 })
  balance: number;

  @Column({ default: 0 })
  salaryBonus: number;

  @ManyToOne(() => User, (user) => user.companies)
  owner: User;

  @ManyToMany(() => User, (user) => user.employedIn)
  employees: User[]; // Empleados de la empresa

  @OneToMany(() => EmploymentRequest, (request) => request.company)
  employmentRequests: EmploymentRequest[];
}