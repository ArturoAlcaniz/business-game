import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(JwtAuthGuard) // Ejemplo de endpoint protegido
  @Post('create')
  async createCompany(@Body('name') name: string, @Request() req) {
    return this.companyService.createCompany(name, req.user.id);
  }

  @UseGuards(JwtAuthGuard) // Ejemplo de endpoint protegido
  @Post('add-money')
  async addMoneyToCompany(
    @Body('companyId') companyId: number,
    @Body('amount') amount: number,
    @Request() req,
  ) {
    return this.companyService.addMoneyToCompany(companyId, amount, req.user.id);
  }

  @UseGuards(JwtAuthGuard) // Ejemplo de endpoint protegido
  @Post('calculate-profits')
  async calculateDailyProfits(@Body('companyId') companyId: number) {
    return this.companyService.calculateDailyProfits(companyId);
  }

  @UseGuards(JwtAuthGuard) // Ejemplo de endpoint protegido
  @Post('request-employment')
  async requestEmployment(@Body('companyId') companyId: number, @Request() req) {
    return this.companyService.requestEmployment(companyId, req.user.id);
  }

  @UseGuards(JwtAuthGuard) // Ejemplo de endpoint protegido
  @Post('accept-employment-request/:requestId')
  async acceptEmploymentRequest(@Param('requestId') requestId: number, @Request() req) {
    return this.companyService.acceptEmploymentRequest(requestId, req.user.id);
  }

  @UseGuards(JwtAuthGuard) // Ejemplo de endpoint protegido
  @Post('reject-employment-request/:requestId')
  async rejectEmploymentRequest(@Param('requestId') requestId: number, @Request() req) {
    return this.companyService.rejectEmploymentRequest(requestId, req.user.id);
  }

  @UseGuards(JwtAuthGuard) // Ejemplo de endpoint protegido
  @Get('employment-requests/:companyId')
  async getEmploymentRequests(@Param('companyId') companyId: number, @Request() req) {
    return this.companyService.getEmploymentRequests(companyId, req.user.id);
  }
}