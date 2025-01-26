import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Company } from '../company/company.entity';
import { EmploymentRequest } from '../company/employment-request.entity';
import { Message } from '../chat/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 1 })
  studyLevel: number;

  @Column({ default: 0 })
  balance: number;

  @OneToMany(() => Company, (company) => company.owner)
  companies: Company[];

  @ManyToMany(() => Company, (company) => company.employees)
  @JoinTable()
  employedIn: Company[]; // Empresas en las que el usuario trabaja

  @OneToMany(() => EmploymentRequest, (request) => request.user)
  employmentRequests: EmploymentRequest[];

  @Column({ default: 0 })
  consecutiveLoginDays: number; // Días consecutivos de inicio de sesión

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @Column({ 
    type: 'date', 
    transformer: {
      from: (value: Date) => new Date(value).toISOString().split('T')[0].slice(0,10), // format the Date to YYYY-MM-DD
      to: (value: any) => value,
    },
    nullable: true }) // Última fecha de inicio de sesión
  lastDailyMoneyDate: Date;

  @Column({ 
    type: 'date', 
    transformer: {
      from: (value: Date) => new Date(value).toISOString().split('T')[0].slice(0,10), // format the Date to YYYY-MM-DD
      to: (value: any) => value,
    },
    nullable: true }) // Última fecha de inicio de sesión
  lastLoginDate: Date;
}