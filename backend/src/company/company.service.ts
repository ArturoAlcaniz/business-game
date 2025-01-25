import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { User } from '../user/user.entity';
import { EmploymentRequest } from './employment-request.entity';
import { MailService } from '../utils/mail.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EmploymentRequest)
    private readonly employmentRequestRepository: Repository<EmploymentRequest>,
    private readonly mailService: MailService, // Inyectamos el servicio de correo
  ) {}

  async createCompany(name: string, ownerId: number): Promise<Company> {
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) throw new Error('Usuario no encontrado');

    if (owner.balance < 1000) throw new Error('Fondos insuficientes para crear una empresa');

    // Crear la empresa
    const company = this.companyRepository.create({
      name,
      level: 1,
      balance: 1000,
      owner,
    });

    // Descontar el costo de creación de la empresa
    owner.balance -= 1000;
    await this.userRepository.save(owner);

    return this.companyRepository.save(company);
  }

  async addMoneyToCompany(companyId: number, amount: number, userId: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['owner'],
    });
    if (!company) throw new Error('Empresa no encontrada');

    if (company.owner.id !== userId) throw new Error('No eres el dueño de esta empresa');

    const owner = await this.userRepository.findOne({ where: { id: userId } });
    if (!owner) throw new Error('Usuario no encontrado');

    if (owner.balance < amount) throw new Error('Fondos insuficientes');

    // Transferir dinero del usuario a la empresa
    owner.balance -= amount;
    company.balance += amount;

    await this.userRepository.save(owner);
    return this.companyRepository.save(company);
  }

  async calculateDailyProfits(companyId: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['owner', 'employees'],
    });
    if (!company) throw new Error('Empresa no encontrada');

    // Calcular ganancias diarias (1000$ por nivel + 200$ por empleado)
    const dailyProfit = 1000 * company.level + 200 * company.employees.length;

    // Añadir ganancias al dueño
    company.owner.balance += dailyProfit;
    await this.userRepository.save(company.owner);

    return this.companyRepository.save(company);
  }

  async requestEmployment(companyId: number, userId: number): Promise<EmploymentRequest> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['employees'],
    });
    if (!company) throw new Error('Empresa no encontrada');
  
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('Usuario no encontrado');
  
    // Verificar si el usuario ya es empleado de la empresa
    const isAlreadyEmployee = company.employees.some((employee) => employee.id === userId);
    if (isAlreadyEmployee) throw new Error('Ya trabajas en esta empresa');
  
    // Verificar si ya existe una solicitud pendiente
    const existingRequest = await this.employmentRequestRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId }, status: 'pending' },
    });
    if (existingRequest) throw new Error('Ya has enviado una solicitud a esta empresa');
  
    // Crear la solicitud de empleo
    const request = this.employmentRequestRepository.create({
      user,
      company,
      status: 'pending',
    });
  
    return this.employmentRequestRepository.save(request);
  }

  async acceptEmploymentRequest(requestId: number, ownerId: number): Promise<Company> {
    const request = await this.employmentRequestRepository.findOne({
      where: { id: requestId },
      relations: ['company', 'user', 'company.owner'],
    });
    if (!request) throw new Error('Solicitud no encontrada');

    // Verificar que el dueño de la empresa es quien acepta la solicitud
    if (request.company.owner.id !== ownerId) throw new Error('No eres el dueño de esta empresa');

    // Aceptar la solicitud
    request.status = 'accepted';
    await this.employmentRequestRepository.save(request);

    // Añadir el usuario a la lista de empleados de la empresa
    request.company.employees.push(request.user);
    await this.companyRepository.save(request.company);

    // Enviar notificación por correo
    const subject = 'Solicitud de empleo aceptada';
    const text = `¡Felicidades! Tu solicitud para trabajar en la empresa ${request.company.name} ha sido aceptada.`;
    await this.mailService.sendMailQueue(request.user.email, subject, text);

    return request.company;
  }

  async rejectEmploymentRequest(requestId: number, ownerId: number): Promise<EmploymentRequest> {
    const request = await this.employmentRequestRepository.findOne({
      where: { id: requestId },
      relations: ['company', 'company.owner', 'user'],
    });
    if (!request) throw new Error('Solicitud no encontrada');

    // Verificar que el dueño de la empresa es quien rechaza la solicitud
    if (request.company.owner.id !== ownerId) throw new Error('No eres el dueño de esta empresa');

    // Rechazar la solicitud
    request.status = 'rejected';
    await this.employmentRequestRepository.save(request);

    // Enviar notificación por correo
    const subject = 'Solicitud de empleo rechazada';
    const text = `Lamentamos informarte que tu solicitud para trabajar en la empresa ${request.company.name} ha sido rechazada.`;
    await this.mailService.sendMailQueue(request.user.email, subject, text);

    return request;
  }

  async getEmploymentRequests(companyId: number, ownerId: number): Promise<any[]> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['owner'],
    });
    if (!company) throw new Error('Empresa no encontrada');
  
    // Verificar que el dueño de la empresa es quien solicita las solicitudes
    if (company.owner.id !== ownerId) throw new Error('No eres el dueño de esta empresa');
  
    const requests = await this.employmentRequestRepository.find({
      where: { company: { id: companyId }, status: 'pending' },
      relations: ['user'],
    });
  
    // Añadir detalles adicionales a las solicitudes
    return requests.map((request) => {
      const salary = this.calculateSalary(company.level, request.user.studyLevel);
      return {
        id: request.id,
        username: request.user.username,
        studyLevel: request.user.studyLevel,
        salary,
      };
    });
  }
  
  private calculateSalary(companyLevel: number, userStudyLevel: number): number {
    // Fórmula del salario: 500$ por nivel de empresa + 1000$ por nivel de estudios
    return 500 * companyLevel + 1000 * userStudyLevel;
  }
}